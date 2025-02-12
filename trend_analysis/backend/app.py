from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_caching import Cache
from pytrends.request import TrendReq
import pandas as pd

app = Flask(__name__)
CORS(app)

# 🔹 Configure Cache (Stores data in memory for faster access)
app.config['CACHE_TYPE'] = 'simple'  
app.config['CACHE_DEFAULT_TIMEOUT'] = 300  # Cache for 5 minutes
cache = Cache(app)
cache.init_app(app)

# 🔹 Initialize Pytrends
pytrends = TrendReq(hl='en-US', tz=360)

@cache.memoize(300)  # Cache for 5 minutes
def fetch_trends(keyword):
    """Fetch Google Trends data and cache it."""
    pytrends.build_payload([keyword], cat=0, timeframe='today 3-m', geo='', gprop='')
    
    trend_data = pytrends.interest_over_time()
    if trend_data.empty:
        return {"error": "No data available"}

    # 🔹 Convert Timestamp keys to strings for JSON response
    trend_data.index = trend_data.index.astype(str)

    return trend_data.to_dict()

@app.route('/market_research', methods=['GET'])
def market_research():
    keyword = request.args.get('keyword', 'startup')  # Default keyword: startup
    try:
        data = fetch_trends(keyword)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
