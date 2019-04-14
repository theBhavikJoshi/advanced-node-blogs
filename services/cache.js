const redis = require('redis');
const mongoose = require('mongoose');
const util = require('util');

const exec = mongoose.Query.prototype.exec;
const redisUrl = 'redis://127.0.0.1:6379';
const redisClient = redis.createClient(redisUrl);
redisClient.hget = util.promisify(redisClient.hget);

mongoose.Query.prototype.cache = function(options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.hashKey || '');
  return this;
}

mongoose.Query.prototype.exec = async function() {
  if(!this.useCache) {
    return exec.apply(this, arguments);
  }

  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name
    })
  );

  const cacheValue = await redisClient.hget(this.hashKey, key);

  if(cacheValue) {
    const doc = JSON.parse(cacheValue);
    return Array.isArray(doc) 
      ? doc.map(item => new this.model(item))
      : new this.model(doc)
  }
  const result = await exec.apply(this, arguments);
  redisClient.hset(this.hashKey, key, JSON.stringify(result), 'EX', 21600000);
  return result;
}

module.exports = {
  clearHash(hashKey) {
    redisClient.del(JSON.stringify(hashKey));
  }
}