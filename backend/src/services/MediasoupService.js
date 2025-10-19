/**
 * Mediasoup SFU Service for Scalable Live Classes
 * Integrated with existing SGT backend system
 * Handles 10,000+ concurrent students per class
 */

const mediasoup = require('mediasoup');
const Redis = require('ioredis');
const EventEmitter = require('events');

class MediasoupService extends EventEmitter {
  constructor() {
    super();
    this.workers = [];
    this.routers = new Map(); // classId -> router
    this.transports = new Map(); // transportId -> transport
    this.producers = new Map(); // producerId -> producer
    this.consumers = new Map(); // consumerId -> consumer
    
    // Class management
    this.classes = new Map(); // classId -> class info
    this.participants = new Map(); // userId -> participant info
    
    // Redis for scaling (disabled for single-instance mode)
    this.redis = null;
    this.useRedis = process.env.USE_REDIS === 'true';
    
    // Configuration
    this.config = {
      worker: {
        rtcMinPort: parseInt(process.env.MEDIASOUP_MIN_PORT) || 10000,
        rtcMaxPort: parseInt(process.env.MEDIASOUP_MAX_PORT) || 11000, // Expanded from 10100 to 11000
        logLevel: 'warn',
        logTags: [
          'info',
          'ice',
          'dtls',
          'rtp',
          'srtp',
          'rtcp',
          'rtx',
          'bwe',
          'score',
          'simulcast',
          'svc'
        ],
      },
      router: {
        mediaCodecs: [
          {
            kind: 'audio',
            mimeType: 'audio/opus',
            clockRate: 48000,
            channels: 2,
          },
          {
            kind: 'video',
            mimeType: 'video/VP8',
            clockRate: 90000,
            parameters: {
              'x-google-start-bitrate': 1000,
            },
          },
          {
            kind: 'video',
            mimeType: 'video/VP9',
            clockRate: 90000,
            parameters: {
              'profile-id': 2,
              'x-google-start-bitrate': 1000,
            },
          },
          {
            kind: 'video',
            mimeType: 'video/h264',
            clockRate: 90000,
            parameters: {
              'packetization-mode': 1,
              'profile-level-id': '4d0032',
              'level-asymmetry-allowed': 1,
              'x-google-start-bitrate': 1000,
            },
          },
          {
            kind: 'video',
            mimeType: 'video/h264',
            clockRate: 90000,
            parameters: {
              'packetization-mode': 1,
              'profile-level-id': '42e01f',
              'level-asymmetry-allowed': 1,
              'x-google-start-bitrate': 1000,
            },
          },
        ],
      },
      webRtcTransport: {
        listenIps: [
          {
            ip: '0.0.0.0',
            announcedIp: process.env.MEDIASOUP_ANNOUNCED_IP || process.env.EXTERNAL_IP || '127.0.0.1',
          },
        ],
        maxIncomingBitrate: 1500000,
        initialAvailableOutgoingBitrate: 1000000,
        minimumAvailableOutgoingBitrate: 600000,
        maxSctpMessageSize: 262144,
      },
    };

    this.workerIndex = 0;
    this.isInitialized = false;
  }

  /**
   * Initialize the Mediasoup service
   */
  async initialize() {
    try {
      console.log('🚀 Initializing Mediasoup SFU Service...');

      // Initialize Redis connection
      await this.initializeRedis();

      // Create worker processes
      const numWorkers = parseInt(process.env.MEDIASOUP_WORKERS) || require('os').cpus().length;
      
      for (let i = 0; i < numWorkers; i++) {
        await this.createWorker();
      }

      this.isInitialized = true;
      console.log(`✅ Mediasoup SFU Service initialized with ${this.workers.length} workers`);
      
      // Setup periodic cleanup
      this.setupCleanup();
      
    } catch (error) {
      console.error('❌ Failed to initialize Mediasoup service:', error);
      throw error;
    }
  }

  /**
   * Initialize Redis connection for scaling (optional)
   */
  async initializeRedis() {
    if (!this.useRedis) {
      console.log('📡 Running in single-instance mode (Redis disabled)');
      return;
    }
    
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      this.redis = new Redis(redisUrl, {
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });

      await this.redis.connect();
      console.log('📡 Connected to Redis for SFU scaling');
      
    } catch (error) {
      console.warn('⚠️ Redis connection failed, running without clustering:', error.message);
      this.redis = null;
    }
  }

  /**
   * Create a mediasoup worker
   */
  async createWorker() {
    try {
      const worker = await mediasoup.createWorker({
        logLevel: this.config.worker.logLevel,
        logTags: this.config.worker.logTags,
        rtcMinPort: this.config.worker.rtcMinPort,
        rtcMaxPort: this.config.worker.rtcMaxPort,
      });

      worker.on('died', () => {
        console.error('❌ Mediasoup worker died, creating new one...');
        this.workers = this.workers.filter(w => w !== worker);
        this.createWorker();
      });

      this.workers.push(worker);
      console.log(`👷 Created Mediasoup worker ${this.workers.length}`);
      
      return worker;
    } catch (error) {
      console.error('❌ Failed to create worker:', error);
      throw error;
    }
  }

  /**
   * Get the next available worker (load balancing)
   */
  getNextWorker() {
    if (this.workers.length === 0) {
      throw new Error('No workers available');
    }

    const worker = this.workers[this.workerIndex % this.workers.length];
    this.workerIndex++;
    return worker;
  }

  /**
   * Create a router for a live class
   */
  async createClassRouter(classId) {
    try {
      if (this.routers.has(classId)) {
        return this.routers.get(classId);
      }

      const worker = this.getNextWorker();
      const router = await worker.createRouter({
        mediaCodecs: this.config.router.mediaCodecs,
      });

      this.routers.set(classId, router);
      
      // Store class info
      this.classes.set(classId, {
        classId,
        router,
        participants: new Set(),
        createdAt: Date.now(),
        lastActivity: Date.now(),
      });

      console.log(`📺 Created router for class ${classId}`);
      
      // Notify via Redis for clustering
      if (this.redis) {
        await this.redis.publish('mediasoup:router:created', JSON.stringify({
          classId,
          workerId: worker.pid,
          timestamp: Date.now(),
        }));
      }

      return router;
    } catch (error) {
      console.error(`❌ Failed to create router for class ${classId}:`, error);
      throw error;
    }
  }

  /**
   * Create WebRTC transport
   */
  async createWebRtcTransport(classId, direction = 'both') {
    try {
      console.log(`🔥 MEDIASOUP DEBUG: Creating WebRTC transport on server`);
      const router = await this.getOrCreateRouter(classId);
      
      const transport = await router.createWebRtcTransport({
        ...this.config.webRtcTransport,
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
      });

      // Add transport event monitoring for debugging
      transport.on('dtlsstatechange', (dtlsState) => {
        console.log(`🔥 DTLS DEBUG: Transport ${transport.id} DTLS state:`, dtlsState);
        if (dtlsState === 'failed') {
          console.error(`❌ DTLS FAILED for transport ${transport.id} - Check certificates`);
        }
      });

      transport.on('icestatechange', (iceState) => {
        console.log(`🔥 ICE DEBUG: Transport ${transport.id} ICE state:`, iceState);
        if (iceState === 'failed') {
          console.error(`❌ ICE FAILED for transport ${transport.id} - Check network connectivity`);
        }
      });

      this.transports.set(transport.id, { transport, classId, direction });

      console.log(`� MEDIASOUP DEBUG: Transport created successfully on server`);
      console.log(`�🚛 Created ${direction} transport ${transport.id} for class ${classId}`);
      console.log(`🔍 Transport ICE candidates:`, transport.iceCandidates);

      return {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
        sctpParameters: transport.sctpParameters,
      };
    } catch (error) {
      console.error(`❌ Failed to create transport for class ${classId}:`, error);
      throw error;
    }
  }

  /**
   * Connect WebRTC transport
   */
  async connectWebRtcTransport(transportId, dtlsParameters) {
    try {
      console.log(`� DTLS DEBUG: Transport connection starting on server`);
      console.log(`�🔗 Connecting transport ${transportId}`);
      console.log(`🔍 DTLS parameters:`, {
        fingerprints: dtlsParameters?.fingerprints?.length || 0,
        role: dtlsParameters?.role
      });
      
      const transportData = this.transports.get(transportId);
      if (!transportData) {
        throw new Error(`Transport ${transportId} not found`);
      }

      // Check if transport is already connected or connecting
      if (transportData.connected || transportData.connecting) {
        console.log(`⚠️ Transport ${transportId} already connected/connecting, skipping`);
        return;
      }
      
      // Mark as connecting to prevent duplicate calls
      transportData.connecting = true;
      
      try {
        console.log(`🔥 DTLS DEBUG: About to connect transport on mediasoup server`);
        await transportData.transport.connect({ dtlsParameters });
        console.log(`🔥 DTLS DEBUG: Transport connected successfully on server`);
        transportData.connected = true;
        transportData.connecting = false;
        console.log(`🔗 Connected transport ${transportId}`);
        
      } catch (connectError) {
        transportData.connecting = false;
        throw connectError;
      }
      
    } catch (error) {
      console.error(`❌ Failed to connect transport ${transportId}:`, error);
      throw error;
    }
  }

  /**
   * Create producer (teacher sending media)
   */
  async createProducer(transportId, rtpParameters, kind, userId, classId) {
    try {
      const transportData = this.transports.get(transportId);
      if (!transportData) {
        throw new Error(`Transport ${transportId} not found`);
      }

      console.log(`🔥 MEDIASOUP DEBUG: Producer creation starting on server`);
      console.log(`🎬 PRODUCE REQUEST: ${kind} for user ${userId} in class ${classId}`);
      console.log(`🔍 Transport ID: ${transportId}`);
      console.log(`🔍 RTP Parameters check:`, {
        hasRtpParameters: !!rtpParameters,
        codecsCount: rtpParameters?.codecs?.length || 0,
        encodingsCount: rtpParameters?.encodings?.length || 0,
        ssrc: rtpParameters?.encodings?.[0]?.ssrc
      });
      
      // CRITICAL DEBUG: Log all existing producers before cleanup
      console.log(`🔍 SSRC DEBUG: Current producer registry before cleanup:`);
      for (const [id, data] of this.producers) {
        console.log(`  - Producer ${id}: user=${data.userId}, kind=${data.kind}, class=${data.classId}, closed=${data.producer.closed}`);
      }

      // CRITICAL FIX: Clean up existing producers more thoroughly to prevent SSRC conflicts
      const existingProducers = Array.from(this.producers.values())
        .filter(p => p.userId === userId && p.kind === kind && p.classId === classId);
      
      for (const existingProducerData of existingProducers) {
        console.log(`🧹 Cleaning up existing producer ${existingProducerData.producer.id} for user ${userId}`);
        
        // Close the producer first
        if (!existingProducerData.producer.closed) {
          existingProducerData.producer.close();
        }
        
        // Remove from registry
        this.producers.delete(existingProducerData.producer.id);
        console.log(`�️ Removed producer ${existingProducerData.producer.id} from registry`);
      }

      // Add small delay to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // CRITICAL DEBUG: Log producer registry after cleanup
      console.log(`🔍 SSRC DEBUG: Producer registry after cleanup:`);
      for (const [id, data] of this.producers) {
        console.log(`  - Producer ${id}: user=${data.userId}, kind=${data.kind}, class=${data.classId}, closed=${data.producer.closed}`);
      }

      console.log(`🔥 MEDIASOUP DEBUG: About to create producer on mediasoup server`);
      console.log(`📡 Creating producer on mediasoup...`);
      console.log(`🔍 SSRC DEBUG: RTP Parameters details:`, JSON.stringify(rtpParameters, null, 2));

      // Log transport state before producing
      const transport = transportData.transport;
      console.log(`🔥 ICE DEBUG: Transport ${transport.id} ICE state:`, transport.iceState);
      console.log(`🔥 DTLS DEBUG: Transport ${transport.id} DTLS state:`, transport.dtlsState);

      let producer;
      try {
        producer = await transport.produce({
          kind,
          rtpParameters,
        });
      } catch (produceError) {
        console.error(`❌ PRODUCE ERROR:`, produceError);
        console.error(`Error details:`, {
          message: produceError.message,
          stack: produceError.stack,
          transportId,
          kind
        });
        
        // If SSRC conflict, perform aggressive cleanup and retry multiple times
        if (produceError.message.includes('ssrc already exists')) {
          console.log(`🔄 SSRC conflict detected, performing aggressive cleanup and retrying...`);
          
          // Extract SSRC from error message
          const ssrcMatch = produceError.message.match(/ssrc:(\d+)/);
          const conflictingSsrc = ssrcMatch ? ssrcMatch[1] : 'unknown';
          console.log(`🔍 Conflicting SSRC: ${conflictingSsrc}`);
          
          // More aggressive cleanup - find and close ANY producer that might have this SSRC
          const allProducers = Array.from(this.producers.values());
          for (const producerData of allProducers) {
            if (producerData.userId === userId || producerData.kind === kind) {
              console.log(`🧹 AGGRESSIVE: Closing potentially conflicting producer ${producerData.producer.id}`);
              try {
                if (!producerData.producer.closed) {
                  producerData.producer.close();
                }
                this.producers.delete(producerData.producer.id);
              } catch (e) {
                console.error(`Error in aggressive cleanup:`, e);
              }
            }
          }
          
          // Try multiple times with increasing delays
          let retryCount = 0;
          const maxRetries = 3;
          
          while (retryCount < maxRetries) {
            retryCount++;
            const delayMs = retryCount * 1000; // 1s, 2s, 3s
            console.log(`🔄 SSRC conflict retry ${retryCount}/${maxRetries}, waiting ${delayMs}ms...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
            
            try {
              producer = await transport.produce({
                kind,
                rtpParameters,
              });
              console.log(`✅ Producer creation succeeded on retry ${retryCount}`);
              break;
            } catch (retryError) {
              console.error(`❌ Producer creation failed on retry ${retryCount}:`, retryError);
              if (retryCount === maxRetries) {
                throw retryError;
              }
            }
          }
        } else {
          throw produceError;
        }
      }

      this.producers.set(producer.id, {
        producer,
        userId,
        classId,
        kind,
        createdAt: Date.now(),
      });

      console.log(`� PRODUCER LIFECYCLE: Producer created and stored in registry`);
      console.log(`�📡 Created ${kind} producer ${producer.id} for user ${userId} in class ${classId}`);
      console.log(`🔍 Total producers in registry: ${this.producers.size}`);
      console.log(`🔍 Registry contents:`, Array.from(this.producers.keys()));

      // Notify other participants
      this.emit('newProducer', {
        classId,
        producerId: producer.id,
        userId,
        kind,
      });

      return producer.id;
    } catch (error) {
      console.error(`❌ Failed to create producer:`, error);
      throw error;
    }
  }

  /**
   * Replace existing video producer with screen share (or other track)
   * This method ensures proper cleanup and prevents SSRC conflicts
   */
  async replaceVideoProducer(transportId, rtpParameters, userId, classId, isScreenShare = false) {
    try {
      console.log(`🔄 SCREEN SHARE: Replacing video producer for user ${userId}, isScreenShare: ${isScreenShare}`);
      
      // Find existing video producer for this user
      const existingVideoProducers = Array.from(this.producers.values())
        .filter(p => p.userId === userId && p.kind === 'video' && p.classId === classId);
      
      if (existingVideoProducers.length > 0) {
        console.log(`🔄 Found ${existingVideoProducers.length} existing video producers to replace`);
        
        // Close all consumers of existing video producers first
        for (const existingProducerData of existingVideoProducers) {
          const consumersToClose = Array.from(this.consumers.values())
            .filter(c => c.consumer.producerId === existingProducerData.producer.id);
          
          console.log(`🔄 Closing ${consumersToClose.length} consumers for producer ${existingProducerData.producer.id}`);
          
          for (const consumerData of consumersToClose) {
            try {
              if (!consumerData.consumer.closed) {
                consumerData.consumer.close();
              }
              this.consumers.delete(consumerData.consumer.id);
              console.log(`🔒 Closed consumer ${consumerData.consumer.id}`);
            } catch (err) {
              console.error(`❌ Error closing consumer ${consumerData.consumer.id}:`, err);
            }
          }
          
          // Close the producer
          try {
            if (!existingProducerData.producer.closed) {
              existingProducerData.producer.close();
              console.log(`🔒 Closed existing video producer ${existingProducerData.producer.id}`);
            }
          } catch (err) {
            console.error(`❌ Error closing producer ${existingProducerData.producer.id}:`, err);
          }
          
          // Remove from registry
          this.producers.delete(existingProducerData.producer.id);
          console.log(`🗑️ Removed producer ${existingProducerData.producer.id} from registry`);
        }
        
        // Wait for complete cleanup - longer for screen share
        const waitTime = isScreenShare ? 3000 : 2000;
        console.log(`⏳ Waiting ${waitTime}ms for complete cleanup (${isScreenShare ? 'screen share' : 'camera'})...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      
      // Now create the new video producer (screen share or camera)
      console.log(`🎬 Creating new video producer (${isScreenShare ? 'screen share' : 'camera'}) for user ${userId}`);
      const newProducerId = await this.createProducer(transportId, rtpParameters, 'video', userId, classId);
      
      // Emit specific event for screen share changes
      this.emit('videoProducerReplaced', {
        userId,
        classId,
        newProducerId,
        isScreenShare,
        timestamp: Date.now()
      });
      
      console.log(`✅ Successfully replaced video producer with ${isScreenShare ? 'screen share' : 'camera'}: ${newProducerId}`);
      return newProducerId;
      
    } catch (error) {
      console.error(`❌ Failed to replace video producer:`, error);
      throw error;
    }
  }

  /**
   * Create consumer (student receiving media)
   */
  async createConsumer(transportId, producerId, rtpCapabilities, userId) {
    try {
      console.log(`🔥 MEDIASOUP DEBUG: Consumer creation process starting`);
      console.log(`🔍 Creating consumer - Transport: ${transportId}, Producer: ${producerId}, User: ${userId}`);
      
      const transportData = this.transports.get(transportId);
      const producerData = this.producers.get(producerId);
      
      console.log(`🔍 Transport found: ${!!transportData}, Producer found: ${!!producerData}`);
      console.log(`🔍 Transport state:`, {
        id: transportData?.transport?.id,
        closed: transportData?.transport?.closed,
        connected: transportData?.connected
      });
      console.log(`🔍 Producer state:`, {
        id: producerData?.producer?.id,
        kind: producerData?.kind,  
        closed: producerData?.producer?.closed,
        paused: producerData?.producer?.paused
      });
      
      if (!transportData) {
        throw new Error(`Transport ${transportId} not found`);
      }
      
      if (!producerData) {
        console.log(`🔍 Producer ${producerId} not found. Current producers:`, Array.from(this.producers.keys()));
        console.log(`🔍 Producer registry dump:`, Array.from(this.producers.entries()).map(([id, data]) => ({
          id,
          userId: data.userId,
          classId: data.classId,
          kind: data.kind,
          closed: data.producer.closed,
          pendingCleanup: data.pendingCleanup
        })));
        throw new Error(`Producer ${producerId} not found`);
      }
      
      // Check if producer is still valid
      if (producerData.producer.closed) {
        console.log(`🔥 PRODUCER LIFECYCLE: Producer ${producerId} is closed, removing from registry`);
        this.producers.delete(producerId);
        throw new Error(`Producer ${producerId} is closed`);
      }
      
      // If producer is marked for cleanup, remove the mark since it's being actively consumed
      if (producerData.pendingCleanup) {
        console.log(`🔥 CLEANUP DEBUG: Producer ${producerId} was marked for cleanup but is being consumed - canceling cleanup`);
        delete producerData.pendingCleanup;
        delete producerData.cleanupTime;
      }

      // Get router from class registry instead of transport (which doesn't have router property)
      const classId = producerData.classId || transportData.classId;
      const router = this.routers.get(classId);
      
      console.log(`🔍 Looking for router for class ${classId}`);
      console.log(`🔍 Available routers:`, Array.from(this.routers.keys()));
      
      if (!router) {
        console.error('🔍 Router not found for class! Details:', {
          transportId: transportData.transport.id,
          transportClosed: transportData.transport.closed,
          producerClassId: producerData.classId,
          transportClassId: transportData.classId,
          finalClassId: classId,
          availableRouters: Array.from(this.routers.keys())
        });
        throw new Error(`Router not found for class ${classId} - class may have been closed`);
      }
      
      if (router.closed) {
        console.error('🔍 Router is closed for class:', classId);
        throw new Error(`Router for class ${classId} is closed`);
      }
      
      console.log(`✅ Found valid router for class ${classId}`);
      
      // Validate router has the canConsume method
      if (typeof router.canConsume !== 'function') {
        throw new Error('Router canConsume method not available - invalid router object');
      }
      
      console.log(`🔍 Checking if router can consume producer ${producerId}...`);
      
      let canConsume;
      try {
        canConsume = router.canConsume({
          producerId,
          rtpCapabilities,
        });
      } catch (canConsumeError) {
        console.error(`❌ Error checking canConsume:`, canConsumeError);
        throw new Error(`Failed to check router canConsume: ${canConsumeError.message}`);
      }
      
      console.log(`🔍 Router canConsume result: ${canConsume}`);
      
      if (!canConsume) {
        throw new Error(`Router cannot consume producer ${producerId} - RTP capabilities mismatch`);
      }

      console.log(`🔄 Creating consumer on transport...`);
      
      const consumer = await transportData.transport.consume({
        producerId,
        rtpCapabilities,
        paused: true, // Start paused
      });

      console.log(`✅ Consumer created successfully:`, {
        id: consumer.id,
        kind: consumer.kind,
        producerId: consumer.producerId,
        paused: consumer.paused
      });

      this.consumers.set(consumer.id, {
        consumer,
        userId,
        producerId,
        classId: producerData.classId,
        createdAt: Date.now(),
      });

      console.log(`📺 Consumer ${consumer.id} stored for user ${userId}`);

      const result = {
        id: consumer.id,
        producerId: consumer.producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
      };
      
      console.log(`📤 Returning consumer result:`, result);
      
      return result;
    } catch (error) {
      console.error(`❌ Failed to create consumer:`, error);
      throw error;
    }
  }

  /**
   * Resume consumer
   */
  async resumeConsumer(consumerId) {
    try {
      const consumerData = this.consumers.get(consumerId);
      if (!consumerData) {
        console.warn(`⚠️ Consumer ${consumerId} not found in registry (might already be closed)`);
        return;
      }

      // Check if consumer is already closed
      if (consumerData.consumer.closed) {
        console.warn(`⚠️ Consumer ${consumerId} is already closed, removing from registry`);
        this.consumers.delete(consumerId);
        return;
      }

      await consumerData.consumer.resume();
      console.log(`▶️ Resumed consumer ${consumerId}`);
      
    } catch (error) {
      // Handle specific mediasoup errors gracefully
      if (error.message && error.message.includes('not found')) {
        console.warn(`⚠️ Consumer ${consumerId} not found in mediasoup (cleaning up registry)`);
        this.consumers.delete(consumerId);
        return;
      }
      
      console.error(`❌ Failed to resume consumer ${consumerId}:`, error);
      // Don't re-throw the error to prevent cascade failures
    }
  }

  /**
   * Pause consumer
   */
  async pauseConsumer(consumerId) {
    try {
      const consumerData = this.consumers.get(consumerId);
      if (!consumerData) {
        console.warn(`⚠️ Consumer ${consumerId} not found in registry (might already be closed)`);
        return;
      }

      // Check if consumer is already closed
      if (consumerData.consumer.closed) {
        console.warn(`⚠️ Consumer ${consumerId} is already closed, removing from registry`);
        this.consumers.delete(consumerId);
        return;
      }

      await consumerData.consumer.pause();
      console.log(`⏸️ Paused consumer ${consumerId}`);
      
    } catch (error) {
      // Handle specific mediasoup errors gracefully
      if (error.message && error.message.includes('not found')) {
        console.warn(`⚠️ Consumer ${consumerId} not found in mediasoup (cleaning up registry)`);
        this.consumers.delete(consumerId);
        return;
      }
      
      console.error(`❌ Failed to pause consumer ${consumerId}:`, error);
      // Don't re-throw the error to prevent cascade failures
    }
  }

  /**
   * Close producer (for camera/mic toggle)
   */
  async closeProducer(producerId) {
    try {
      const producerData = this.producers.get(producerId);
      if (!producerData) {
        console.warn(`⚠️ Producer ${producerId} not found (might already be closed)`);
        return;
      }

      // Close the producer
      if (!producerData.producer.closed) {
        producerData.producer.close();
      }

      // Remove from map
      this.producers.delete(producerId);
      
      console.log(`🗑️ Closed producer ${producerId} for user ${producerData.userId}`);
      
    } catch (error) {
      console.error(`❌ Failed to close producer ${producerId}:`, error);
      throw error;
    }
  }

  /**
   * Get or create router for class
   */
  async getOrCreateRouter(classId) {
    if (this.routers.has(classId)) {
      return this.routers.get(classId);
    }
    return this.createClassRouter(classId);
  }

  /**
   * Get existing producers for a class
   */
  getExistingProducers(classId) {
    const producers = [];
    for (const [producerId, data] of this.producers) {
      if (data.classId === classId) {
        producers.push({
          id: producerId,
          producerId,
          peerId: String(data.userId), // Convert to string for consistent comparison
          userId: String(data.userId),
          kind: data.kind,
        });
      }
    }
    console.log(`📋 Returning ${producers.length} existing producers for class ${classId}`);
    return producers;
  }

  /**
   * Add participant to class
   */
  addParticipant(classId, userId, userData = {}) {
    if (!this.classes.has(classId)) {
      throw new Error(`Class ${classId} not found`);
    }

    const classData = this.classes.get(classId);
    
    // Check if participant already exists
    if (classData.participants.has(userId)) {
      console.log(`⚠️ Participant ${userId} already exists in class ${classId}, updating`);
      const existingData = this.participants.get(userId);
      this.participants.set(userId, {
        ...existingData,
        ...userData,
        lastUpdated: Date.now(),
      });
    } else {
      classData.participants.add(userId);
      this.participants.set(userId, {
        userId,
        classId,
        ...userData,
        joinedAt: Date.now(),
      });
      console.log(`👤 Added participant ${userId} to class ${classId}`);
    }
    
    classData.lastActivity = Date.now();
  }

  /**
   * Remove participant from class
   */
  async removeParticipant(classId, userId) {
    try {
      if (this.classes.has(classId)) {
        const classData = this.classes.get(classId);
        classData.participants.delete(userId);
      }

      this.participants.delete(userId);

      // Clean up user's producers and consumers
      await this.cleanupUserMedia(userId);

      console.log(`👋 Removed participant ${userId} from class ${classId}`);
      
    } catch (error) {
      console.error(`❌ Failed to remove participant ${userId}:`, error);
    }
  }

  /**
   * Clean up user's media (producers and consumers) 
   * Modified to be less aggressive with producer cleanup
   */
  async cleanupUserMedia(userId) {
    try {
      console.log(`🔥 CLEANUP DEBUG: Starting media cleanup for user ${userId}`);
      
      // Only close consumers, keep producers for a grace period
      // This prevents "Producer not found" errors for other users
      let producersToCleanup = [];
      let consumersToCleanup = [];
      
      for (const [producerId, data] of this.producers) {
        if (data.userId === userId) {
          producersToCleanup.push({ producerId, data });
        }
      }
      
      for (const [consumerId, data] of this.consumers) {
        if (data.userId === userId) {
          consumersToCleanup.push({ consumerId, data });
        }
      }
      
      // Immediately clean up consumers
      for (const { consumerId, data } of consumersToCleanup) {
        data.consumer.close();
        this.consumers.delete(consumerId);
        console.log(`🗑️ Closed consumer ${consumerId} for user ${userId}`);
      }
      
      // Mark producers for delayed cleanup instead of immediate removal
      for (const { producerId, data } of producersToCleanup) {
        // Mark producer as pending cleanup but don't remove immediately
        data.pendingCleanup = true;
        data.cleanupTime = Date.now() + 30000; // 30 second grace period
        console.log(`⏰ Marked producer ${producerId} for delayed cleanup (30s grace period)`);
      }
      
      // Schedule actual producer cleanup after grace period  
      setTimeout(() => {
        this.cleanupPendingProducers();
      }, 35000);
      
    } catch (error) {
      console.error(`❌ Failed to cleanup media for user ${userId}:`, error);
    }
  }
  
  /**
   * Clean up only user's consumers (for temporary disconnects)
   */
  async cleanupUserConsumers(userId) {
    try {
      console.log(`🔥 CLEANUP DEBUG: Cleaning up only consumers for user ${userId}`);
      
      for (const [consumerId, data] of this.consumers) {
        if (data.userId === userId) {
          data.consumer.close();
          this.consumers.delete(consumerId);
          console.log(`🗑️ Closed consumer ${consumerId} for user ${userId}`);
        }
      }
    } catch (error) {
      console.error(`❌ Failed to cleanup consumers for user ${userId}:`, error);
    }
  }
  
  /**
   * Clean up producers that have been marked for deletion
   */
  cleanupPendingProducers() {
    const now = Date.now();
    for (const [producerId, data] of this.producers) {
      if (data.pendingCleanup && now > data.cleanupTime) {
        console.log(`🔥 CLEANUP DEBUG: Grace period expired, removing producer ${producerId}`);
        data.producer.close();
        this.producers.delete(producerId);
        console.log(`🗑️ Cleaned up producer ${producerId} after grace period`);
      }
    }
  }

  /**
   * Close class and cleanup resources
   */
  async closeClass(classId) {
    try {
      if (!this.classes.has(classId)) {
        return;
      }

      const classData = this.classes.get(classId);
      
      // Close all transports for this class
      for (const [transportId, data] of this.transports) {
        if (data.classId === classId) {
          data.transport.close();
          this.transports.delete(transportId);
        }
      }

      // Close router
      classData.router.close();
      this.routers.delete(classId);
      this.classes.delete(classId);

      console.log(`🔐 Closed class ${classId} and cleaned up resources`);
      
    } catch (error) {
      console.error(`❌ Failed to close class ${classId}:`, error);
    }
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      workers: this.workers.length,
      classes: this.classes.size,
      participants: this.participants.size,
      routers: this.routers.size,
      transports: this.transports.size,
      producers: this.producers.size,
      consumers: this.consumers.size,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }

  /**
   * Setup periodic cleanup
   */
  setupCleanup() {
    setInterval(() => {
      this.performCleanup();
    }, 300000); // Every 5 minutes
  }

  /**
   * Perform periodic cleanup
   */
  performCleanup() {
    const now = Date.now();
    const timeout = 30 * 60 * 1000; // 30 minutes

    // Clean up inactive classes
    for (const [classId, classData] of this.classes) {
      if (now - classData.lastActivity > timeout) {
        console.log(`🧹 Cleaning up inactive class ${classId}`);
        this.closeClass(classId);
      }
    }
  }

  /**
   * Diagnostic method to debug producer/consumer issues
   */
  diagnoseMediaState(classId) {
    console.log(`🔍 MEDIA DIAGNOSIS for class ${classId}:`);
    
    // Check producers
    const classProducers = Array.from(this.producers.entries())
      .filter(([id, data]) => data.classId === classId);
    
    console.log(`📡 PRODUCERS (${classProducers.length}):`);
    classProducers.forEach(([id, data]) => {
      console.log(`  - ${id}: user=${data.userId}, kind=${data.kind}, closed=${data.producer.closed}, paused=${data.producer.paused}`);
    });
    
    // Check consumers
    const classConsumers = Array.from(this.consumers.entries())
      .filter(([id, data]) => data.classId === classId);
    
    console.log(`📺 CONSUMERS (${classConsumers.length}):`);
    classConsumers.forEach(([id, data]) => {
      console.log(`  - ${id}: user=${data.userId}, producerId=${data.producerId}, closed=${data.consumer.closed}, paused=${data.consumer.paused}`);
    });
    
    // Check transports
    const classTransports = Array.from(this.transports.entries())
      .filter(([id, data]) => data.classId === classId);
    
    console.log(`🚛 TRANSPORTS (${classTransports.length}):`);
    classTransports.forEach(([id, data]) => {
      console.log(`  - ${id}: direction=${data.direction}, connected=${data.connected}, iceState=${data.transport.iceState}, dtlsState=${data.transport.dtlsState}`);
    });
    
    // Check for orphaned consumers (consumers without producers)
    const orphanedConsumers = classConsumers.filter(([consumerId, consumerData]) => {
      return !classProducers.find(([producerId, producerData]) => producerId === consumerData.producerId);
    });
    
    if (orphanedConsumers.length > 0) {
      console.log(`⚠️ ORPHANED CONSUMERS (${orphanedConsumers.length}):`);
      orphanedConsumers.forEach(([id, data]) => {
        console.log(`  - ${id}: missing producer ${data.producerId}`);
      });
    }
    
    return {
      producers: classProducers.length,
      consumers: classConsumers.length,
      transports: classTransports.length,
      orphanedConsumers: orphanedConsumers.length
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    const stats = this.getStats();
    const isHealthy = this.isInitialized && this.workers.length > 0;
    
    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      ...stats,
      timestamp: Date.now(),
    };
  }

  /**
   * Shutdown service gracefully
   */
  async shutdown() {
    try {
      console.log('🔄 Shutting down Mediasoup service...');

      // Close all classes
      for (const classId of this.classes.keys()) {
        await this.closeClass(classId);
      }

      // Close workers
      for (const worker of this.workers) {
        worker.close();
      }

      // Close Redis connection
      if (this.redis) {
        await this.redis.disconnect();
      }

      console.log('✅ Mediasoup service shutdown complete');
      
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
    }
  }
}

module.exports = MediasoupService;