import * as redis from 'redis'
import { Env } from 'app/structure/Env';
import { StringUtil, CtError } from 'salesfy-shared';
import { HError } from 'app/util/status/HError';
import { Log } from 'app/structure/Log';

export class LocalStorageRedis {

    public static instance: redis.RedisClient

    public static async load() {
        if (!Env.getRedisIsAvailable()) {
            Log.console('Skipping Redis usage - parameter turned off1');
            return;
        }
        const redisClient = redis.createClient(Env.getRedisPort(), Env.getRedisAddress());
        redisClient.on('connect', () => {
            LocalStorageRedis.verifyWorkerConnection(redisClient);
        })
        redisClient.on('error', (err) => {
            Log.console('Redis client error. Something went wrong: ' + err);
            throw new HError({ ctStatus: CtError.redisProblem, dsConsole: "Unable to connect to Redis " + err.toString() })
        })
        LocalStorageRedis.instance = redisClient
    }

    private static async verifyWorkerConnection(redisClient: redis.RedisClient) {
        Log.console(`Starting up Redis client connection`);
        const nmKeyTest = "Redis startup test worker pid: " + process.pid;
        const dsKeyTest = StringUtil.random();
        redisClient.set(nmKeyTest, dsKeyTest);
        redisClient.get(nmKeyTest, (error, result) => {
            if (error) {
                Log.console(error.toString());
                throw new HError({ ctStatus: CtError.redisProblem, dsConsole: "Redis is not working" + error.toString() });
            }
            if (dsKeyTest != result) {
                throw new HError({ ctStatus: CtError.redisProblem, dsConsole: "Redis is not working: Key is different" });
            }
            Log.console(`Redis client connected`);
        })
    }

    public static set(nmKey: string, dsValue: string, cb?: redis.Callback<'OK'>): Promise<boolean> {
        return new Promise<boolean>(async (res, rej) => {
            if (!Env.getRedisIsAvailable()) {
                Log.console('Skipping Redis usage - parameter turned off2');
                rej()
                return;
            }
            LocalStorageRedis.instance.set(nmKey, dsValue, cb)
            res()
        })
    }

    public static get(nmKey: string): Promise<string> {
        if (!Env.getRedisIsAvailable()) {
            Log.console('Skipping Redis usage - parameter turned off3');
            return new Promise<string>(async (res, rej) => {
                rej()
            })
        }
        return new Promise<string>(async (res, rej) => {
            LocalStorageRedis.instance.get(nmKey, (error: any, dsValue: any) => {
                if (error) {
                    Log.console(error.toString());
                    rej()
                    throw new HError({ ctStatus: CtError.redisProblem, dsConsole: "Redis is not working" + error.toString() });
                }
                res(dsValue)
            })
        })
    }
}
