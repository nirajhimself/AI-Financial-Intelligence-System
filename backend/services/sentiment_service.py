from textblob import TextBlob
from newsapi import NewsApiClient

NEWS_API_KEY = "YOUR_API_KEY"

newsapi = NewsApiClient(api_key=NEWS_API_KEY)

def get_news_sentiment(symbol):
    try:
        articles = newsapi.get_everything(q=symbol, language='en', page_size=5)

        sentiments = []

        for article in articles["articles"]:
            text = article["title"] + " " + (article["description"] or "")
            polarity = TextBlob(text).sentiment.polarity
            sentiments.append(polarity)

        if len(sentiments) == 0:
            return 0

        return sum(sentiments) / len(sentiments)

    except:
        return 0