import pandas as pd
import numpy as np
import yfinance as yf
import json
import logging
from datetime import datetime
from flask import Flask, request
from flask_cors import CORS
from scipy.stats import norm
from flask_caching import Cache
import redis
import time


app = Flask(__name__)
CORS(app)
app.debug = True
logging.basicConfig(level=logging.DEBUG)

app.config['CACHE_TYPE'] = 'redis'
app.config['CACHE_REDIS_HOST'] = 'localhost'
app.config['CACHE_REDIS_PORT'] = 6379
app.config['CACHE_REDIS_DB'] = 0

cache = Cache(app)
cache.init_app(app)

# Initialize Redis client
redis_client = redis.Redis(host='localhost', port=6379, db=0)


@app.route('/<ticker>', methods=['GET'])
def get_price(ticker):
    start_time = time.time()
    stock_price = redis_client.get(f"stock_price_{ticker}")
    if stock_price is None:
        tk = yf.Ticker(ticker)
        price = tk.fast_info.last_price
        price = round(price, 2)
        redis_client.set(f"stock_price_{ticker}", price, 10)
        print('\n\n-------Elapsed Time (w/o cache): ', time.time() - start_time, "-------\n\n")
        return json.dumps({'symbol': ticker, 'price': price})
    if stock_price: 
        print('\n\n-------Elapsed Time Cached: ', time.time() - start_time, "-------\n\n")
    
    retData = {'symbol': ticker, 'price': stock_price.decode("utf-8")}
    return json.dumps(retData)
    
    

if __name__ == "__main__":
    app.run(port=5600, threaded=True)