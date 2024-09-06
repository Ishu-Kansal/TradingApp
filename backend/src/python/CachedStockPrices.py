from datetime import datetime, timedelta
import flask
from flask import Flask, json
import redis
from sqlalchemy import text
import yfinance as yf
from psql import engine
import optionsHelpers
from rq import Queue
from rq_scheduler import Scheduler
from redis import Redis


app = Flask(__name__)

redis_client = redis.Redis(host='localhost', port=6379, db=1, decode_responses=True)
q = Queue(connection=Redis())
scheduler = Scheduler(queue=q, connection=q.connection)

#TODO: Use some sort of API or DB to get all tickers to update
ticker_list = ['NVDA', 'AAPL', 'META', 'AMD', 'TSMC', 'AMZN', 'TSLA', 'GOOGL', 'MSFT']

SCALING_FACTOR = 0.02
EXP_TIME_SECONDS = 10

FIRST_THRESHOLD = SCALING_FACTOR
SECOND_THRESHOLD = 0.05

def updateTicker(ticker: str):
    print('updating ticker', ticker)
    stock_price = redis_client.get(f"stock_price_{ticker}")
    if stock_price is None:
        tk = yf.Ticker(ticker)
        price = tk.fast_info.last_price
        price = round(price, 2)
        redis_client.set(f"stock_price_{ticker}", price, EXP_TIME_SECONDS)
        return {"status": "UPDATE", "ticker": ticker, "price": price, "jump": 10000}
    else:
        currPrice = yf.Ticker(ticker).fast_info.last_price
        if(currPrice > (1+SCALING_FACTOR) * stock_price):
            currPrice = round(currPrice, 2)
            redis_client.set(f"stock_price_{ticker}", currPrice, EXP_TIME_SECONDS)
            return {"status": "UPDATE", "ticker": ticker, "price": currPrice, "jump": (currPrice - stock_price) / stock_price}
        else:
            return {"status": "HOLD", "ticker": ticker, "price": stock_price}
        
def updateOptions(ticker: str, exp: str):
    stock = yf.Ticker(ticker)
    iRate = yf.Ticker('^IRX').fast_info.last_price / 100
    
    greeksChains = optionsHelpers.getOptionsDataWithGreeks(stock, exp, iRate)
    
    with engine.begin() as conn:
        # temp table
        greeksChains['calls'].to_sql('temp_table', conn, index=False, if_exists='replace')

        # create sql query
        sql = text(f"""
            WITH upsert AS (
                INSERT INTO "PaperTrading"."OptionsData" ("contractSymbol", "lastTradeDate", strike, "lastPrice", volume, "openInterest", "impliedVolatility", delta, gamma, theta, rho, vega)
                SELECT "contractSymbol", "lastTradeDate", strike, "lastPrice", volume, "openInterest", "impliedVolatility", delta, gamma, theta, rho, vega FROM temp_table
                ON CONFLICT ("contractSymbol") 
                DO UPDATE SET 
                    "lastTradeDate" = EXCLUDED."lastTradeDate",
                    "lastPrice" = EXCLUDED."lastPrice",
                    volume = EXCLUDED.volume,
                    "openInterest" = EXCLUDED."openInterest",
                    "impliedVolatility" = EXCLUDED."impliedVolatility",
                    delta = EXCLUDED.delta,
                    gamma = EXCLUDED.gamma,
                    theta = EXCLUDED.theta,
                    rho = EXCLUDED.rho,
                    vega = EXCLUDED.vega
                RETURNING 1
            )
            SELECT COUNT(*) FROM upsert
        """)

        result = conn.execute(sql)
        updatedCount = result.scalar()

        # drop temp
        conn.execute(text("DROP TABLE temp_table;"))
    
    with engine.begin() as conn:
        # temp table
        greeksChains['puts'].to_sql('temp_table', conn, index=False, if_exists='replace')

        # create query
        sql = text(f"""
            WITH upsert AS (
                INSERT INTO "PaperTrading"."OptionsData" ("contractSymbol", "lastTradeDate", strike, "lastPrice", volume, "openInterest", "impliedVolatility", delta, gamma, theta, rho, vega)
                SELECT "contractSymbol", "lastTradeDate", strike, "lastPrice", volume, "openInterest", "impliedVolatility", delta, gamma, theta, rho, vega FROM temp_table
                ON CONFLICT ("contractSymbol") 
                DO UPDATE SET 
                    "lastTradeDate" = EXCLUDED."lastTradeDate",
                    "lastPrice" = EXCLUDED."lastPrice",
                    volume = EXCLUDED.volume,
                    "openInterest" = EXCLUDED."openInterest",
                    "impliedVolatility" = EXCLUDED."impliedVolatility",
                    delta = EXCLUDED.delta,
                    gamma = EXCLUDED.gamma,
                    theta = EXCLUDED.theta,
                    rho = EXCLUDED.rho,
                    vega = EXCLUDED.vega
                RETURNING 1
            )
            SELECT COUNT(*) FROM upsert
        """)

        result = conn.execute(sql)
        updatedCount += result.scalar()

        # drop temp
        conn.execute(text("DROP TABLE temp_table;"))
            
    return {"updatedCount": updatedCount}

def enqueueUpdates():
    for ticker in ticker_list:
        result = updateTicker(ticker)
        exps = yf.Ticker(ticker).options
        for exp in exps:
            q.enqueue(updateOptions, ticker, exp)
        # if(result['status'] == 'UPDATE'):
        #     jump = result['jump']
        #     exps = yf.Ticker(ticker).options
        #     if(jump > FIRST_THRESHOLD and jump < SECOND_THRESHOLD):
        #         expsToUpdate = exps[:len(exps)//3]
        #         for exp in expsToUpdate:
        #             q.enqueue(updateOptions, ticker, exp)
        #     if(jump >= SECOND_THRESHOLD):
        #         for exp in exps:
        #             q.enqueue(updateOptions, ticker, exp)
        print('ENQUEUED updates for ticker ', ticker)

def periodic_task():
    """
    This function runs every 10 seconds.
    """
    print("Running periodic task...", flush=True)
    # Your code here

@app.route('/')
def home():
    return "Flask server is running, and background tasks are scheduled every 10 seconds."

                
if __name__ == "__main__":
    # Schedule the task to run every 10 seconds
    scheduler.schedule(
        scheduled_time=datetime.now(), # first run 10 seconds from now
        func=periodic_task(),                   # function to be queued
        interval=10,                          # time in seconds between each run
        repeat=None                           # repeat forever
    )
    
    # Run the Flask server
    app.run(port=5000, debug=True)


