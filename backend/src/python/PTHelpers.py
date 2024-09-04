import time
from psql import conn


def executeOrders(data):
    conn.rollback()
    startTime = time.time()
    
    bids = data["bids"]
    asks = data["asks"]
    
    transactionStatus = []
    
    for transaction in bids:
        user_id = int(transaction['user_id'])
        ticker = transaction['ticker']
        quantity = float(transaction['quantity'])
        price = float(data['curr_price'])
        
        statusVar = {
            "hash": transaction['hash'],
            "user_id": user_id,
            "ticker": ticker,
            "status": ''
        }
        
        cur = conn.cursor()
        cur.execute(f'SELECT * FROM "PaperTrading"."Positions" WHERE user_id = {user_id} AND ticker = \'{transaction['ticker']}\'')
        conn.commit()
        rows = cur.fetchall()
        
        if len(rows) == 0:
            try: 
                curInsert = conn.cursor()
                curInsert.execute(f'INSERT INTO "PaperTrading"."Positions" (user_id, ticker, quantity, average_price) VALUES ({user_id}, \'{ticker}\', {quantity}, {price})')
                curInsert.execute(f'UPDATE "PaperTrading"."Positions" SET quantity=quantity-{quantity*price} WHERE (user_id={user_id} AND ticker=\'CASH\')')
                conn.commit()
                curInsert.close()
                statusVar['status'] = 'BOUGHT'
            except: 
                statusVar['status'] = 'ERROR: BUY TRANSACTION NOT COMPLETED'
        else: 
            oldAveragePrice = float(rows[0][4])
            oldQuantity = float(rows[0][3])
            oldTotalPrice = oldAveragePrice * oldQuantity
            
            newPrice =  quantity * price
            newAvgPrice = round((oldTotalPrice + newPrice) / (oldQuantity + quantity), 2)
            print('\n','new average price: ', newAvgPrice, '\n')
            try:
                curUpdate = conn.cursor()
                curUpdate.execute(f'UPDATE "PaperTrading"."Positions" SET quantity={oldQuantity+quantity}, average_price={newAvgPrice} WHERE (user_id={user_id} AND ticker=\'{ticker}\')')
                curUpdate.execute(f'UPDATE "PaperTrading"."Positions" SET quantity=quantity-{quantity*price} WHERE (user_id={user_id} AND ticker=\'CASH\')')
                conn.commit()
                curUpdate.close()
                statusVar['status'] = 'BOUGHT'
            except:
                statusVar['status'] = 'ERROR: BUY TRANSACTION NOT COMPLETED'
                
        transactionStatus.append(statusVar)
        cur.close()
        
    for transaction in asks:
        user_id = int(transaction['user_id'])
        ticker = transaction['ticker']
        quantity = float(transaction['quantity'])
        price = float(data['curr_price'])
        
        statusVar = {
            "hash": transaction['hash'],
            "user_id": user_id,
            "ticker": ticker,
            "status": ''
        }
        
        cur = conn.cursor()
        cur.execute(f'SELECT * FROM "PaperTrading"."Positions" WHERE user_id = {user_id} AND ticker = \'{transaction['ticker']}\'')
        conn.commit()
        rows = cur.fetchall()
        
        if len(rows) == 0:
            statusVar['status'] = 'ERROR: EXISTING POSITION NOT FOUND'
        else: 
            '''
            FIX: average price not computing correctly
            '''
            oldAveragePrice = float(rows[0][4])
            oldQuantity = float(rows[0][3])
            oldTotalPrice = oldAveragePrice * oldQuantity
            
            newPrice =  quantity * price
            newAvgPrice = round((oldTotalPrice - newPrice) / (oldQuantity - quantity), 2)
            print('\n','new average price sell: ', newAvgPrice, '\n')
            try:
                curUpdate = conn.cursor()
                curUpdate.execute(f'UPDATE "PaperTrading"."Positions" SET quantity=quantity-{quantity}, average_price={newAvgPrice} WHERE (user_id={user_id} AND ticker=\'{ticker}\')')
                curUpdate.execute(f'UPDATE "PaperTrading"."Positions" SET quantity=quantity+{quantity*price} WHERE (user_id={user_id} AND ticker=\'CASH\')')
                conn.commit()
                curUpdate.close()
                statusVar['status'] =  'SOLD'
            except:
                statusVar['status'] =  'ERROR: POSITION UNABLE TO SELL'
                
        transactionStatus.append(statusVar)
        cur.close()
        
    print(f'\n------TIME ELAPSED: {time.time()-startTime}------\n')
    return transactionStatus
            
    