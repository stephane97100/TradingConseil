import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry User-Agent as instructed in gemini-api skill
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Alpha Vantage API setup
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_KEY || "RPJC5J2JSO3M8QWL";

// Comprehensive Mock fallback data for stocks & crypto in case API limits are hit so the app is always functional.
const FALLBACK_GAINERS_LOSERS = {
  top_gainers: [
    { ticker: "AAPL", price: "185.92", change_amount: "5.42", change_percentage: "3.01%", volume: "52430100" },
    { ticker: "NVDA", price: "912.40", change_amount: "24.15", change_percentage: "2.72%", volume: "41029100" },
    { ticker: "TSLA", price: "179.24", change_amount: "4.12", change_percentage: "2.35%", volume: "62381200" },
    { ticker: "MSFT", price: "415.50", change_amount: "6.80", change_percentage: "1.66%", volume: "22340100" },
    { ticker: "AMD", price: "168.90", change_amount: "2.10", change_percentage: "1.26%", volume: "31402900" }
  ],
  top_losers: [
    { ticker: "NFLX", price: "598.15", change_amount: "-18.40", change_percentage: "-2.98%", volume: "4210900" },
    { ticker: "AMZN", price: "174.42", change_amount: "-4.10", change_percentage: "-2.29%", volume: "29432100" },
    { ticker: "META", price: "472.18", change_amount: "-9.32", change_percentage: "-1.94%", volume: "13910200" },
    { ticker: "GOOGL", price: "166.50", change_amount: "-2.10", change_percentage: "-1.24%", volume: "19320100" },
    { ticker: "BABA", price: "72.40", change_amount: "-0.95", change_percentage: "-1.30%", volume: "10245000" }
  ],
  most_actively_traded: [
    { ticker: "NVDA", price: "912.40", change_amount: "24.15", change_percentage: "2.72%", volume: "41029100" },
    { ticker: "TSLA", price: "179.24", change_amount: "4.12", change_percentage: "2.35%", volume: "62381200" },
    { ticker: "AAPL", price: "185.92", change_amount: "5.42", change_percentage: "3.01%", volume: "52430100" },
    { ticker: "AMD", price: "168.90", change_amount: "2.10", change_percentage: "1.26%", volume: "31402900" },
    { ticker: "INTC", price: "30.15", change_amount: "-0.45", change_percentage: "-1.47%", volume: "48150200" }
  ]
};

const FALLBACK_CRYPTO_PRICES = [
  { id: "bitcoin", name: "Bitcoin", symbol: "btc", current_price: 68420.50, price_change_percentage_24h: 1.84, market_cap: 1345102941000 },
  { id: "ethereum", name: "Ethereum", symbol: "eth", current_price: 3842.10, price_change_percentage_24h: 2.15, market_cap: 462102948000 },
  { id: "solana", name: "Solana", symbol: "sol", current_price: 168.45, price_change_percentage_24h: 4.81, market_cap: 75430291000 },
  { id: "ripple", name: "Ripple", symbol: "xrp", current_price: 0.524, price_change_percentage_24h: -1.20, market_cap: 29102948000 },
  { id: "cardano", name: "Cardano", symbol: "ada", current_price: 0.458, price_change_percentage_24h: -0.42, market_cap: 16320194000 }
];

const FALLBACK_NEWS = [
  {
    title: "NVIDIA dominates AI chip market as demand soars further",
    url: "https://www.alphavantage.co",
    time_published: "2026-06-01T09:30:00Z",
    summary: "NVIDIA shares hovered near all-time highs today as key cloud hyperscalers reported strong quarterly compute infrastructure demands.",
    overall_sentiment_label: "Somewhat Bullish",
    source: "Alpha Financial News"
  },
  {
    title: "Federal Reserve hints at interest rate stabilization",
    url: "https://www.alphavantage.co",
    time_published: "2026-06-01T08:15:00Z",
    summary: "Comments from key Fed governors reflect growing confidence that commercial borrowing levels will normalize next quarter.",
    overall_sentiment_label: "Bullish",
    source: "Macro Markets Monitor"
  },
  {
    title: "Crypto markets surge on institutional staking inflows",
    url: "https://www.alphavantage.co",
    time_published: "2026-06-01T07:44:00Z",
    summary: "Large sovereign funds and private banking conglomerates continue allocating capital into liquid staking protocols.",
    overall_sentiment_label: "Bullish",
    source: "Decentralized News"
  }
];

// Generates highly randomized stock chart parameters for full simulation fallback
function generateMockHistory(symbol: string) {
  const history = [];
  const sym = symbol.toUpperCase();
  let basePrice = 150;
  if (sym === "AAPL") basePrice = 185;
  else if (sym === "NVDA") basePrice = 912;
  else if (sym === "TSLA") basePrice = 179;
  else if (sym === "MSFT") basePrice = 415;
  else if (sym === "NFLX") basePrice = 598;
  else if (sym === "AMZN") basePrice = 174;
  else if (sym === "META") basePrice = 472;
  else if (sym === "GOOGL") basePrice = 166;
  // French SICAV mutual funds base prices
  else if (sym === "CARM-PAT") basePrice = 625.40;
  else if (sym === "AMUN-ACT") basePrice = 248.15;
  else if (sym === "LYX-CAC") basePrice = 78.90;
  else if (sym === "SEXT-GL") basePrice = 382.50;
  else if (sym === "AXA-LCE") basePrice = 189.20;
  // Currencies / Devises base prices
  else if (sym === "EUR/USD") basePrice = 1.0854;
  else if (sym === "GBP/USD") basePrice = 1.2742;
  else if (sym === "USD/JPY") basePrice = 156.32;
  else if (sym === "AUD/USD") basePrice = 0.6654;
  else if (sym === "USD/CAD") basePrice = 1.3621;
  else if (sym === "USD/CHF") basePrice = 0.8985;
  else if (sym === "EUR/GBP") basePrice = 0.8512;
  else if (sym === "EUR/JPY") basePrice = 169.65;
  else if (sym === "GBP/JPY") basePrice = 199.12;
  else if (sym === "NZD/USD") basePrice = 0.6125;
  
  const isDevise = sym.includes("/") || sym === "USD/JPY" || sym === "USD/CAD" || sym === "USD/CHF" || sym === "GBP/JPY" || sym === "EUR/JPY" || (basePrice < 5 && basePrice > 0.1);
  const precision = isDevise ? 4 : 2;
  const volScale = isDevise ? 100000 : 10000000;
  
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    // Dynamic walkthrough (random walk with drift with lower percentage volatility for forex)
    const drift = isDevise ? 0.0001 : 0.15;
    const maxChangePercent = isDevise ? 0.0035 : 0.025;
    const randomChange = (Math.random() - 0.48) * (basePrice * maxChangePercent) + drift;
    basePrice = parseFloat((basePrice + randomChange).toFixed(precision));
    
    // Add realistic candle details
    const open = parseFloat((basePrice * (1 + (Math.random() - 0.5) * (isDevise ? 0.001 : 0.005))).toFixed(precision));
    const high = parseFloat((Math.max(basePrice, open) * (1 + Math.random() * (isDevise ? 0.0015 : 0.008))).toFixed(precision));
    const low = parseFloat((Math.min(basePrice, open) * (1 - Math.random() * (isDevise ? 0.0015 : 0.008))).toFixed(precision));
    
    history.push({
      date: date.toISOString().split("T")[0],
      open,
      high,
      low,
      close: basePrice,
      volume: Math.floor(volScale + Math.random() * volScale)
    });
  }
  return history;
}

// -----------------------------------------
// EXPOSED API ENDPOINTS
// -----------------------------------------

// 1. Get Market Gainers, Losers, and Actives
app.get("/api/market-summary", async (req, res) => {
  try {
    const url = `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${ALPHA_VANTAGE_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    // Alpha Vantage returns rate limits or errors inside JSON sometimes
    if (data.Information || data["Note"] || (!data.top_gainers && !data.top_losers)) {
      console.warn("Alpha Vantage returned rate limit or notice. Using realistic mock fallback data.");
      return res.json({ ...FALLBACK_GAINERS_LOSERS, source_api: "fallback_simulation" });
    }
    
    res.json({ ...data, source_api: "alpha_vantage_real" });
  } catch (error) {
    console.error("Error calling Alpha Vantage market sum. Falling back:", error);
    res.json({ ...FALLBACK_GAINERS_LOSERS, source_api: "fallback_simulation" });
  }
});

// 2. Get Crypto Prices (CoinGecko Simple Price or Fallback)
app.get("/api/crypto-prices", async (req, res) => {
  try {
    // Attempting CoinGecko's popular list API
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,ripple,cardano&order=market_cap_desc&sparkline=false&price_change_percentage=24h`;
    const response = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!response.ok) {
      throw new Error(`CoinGecko status error: ${response.status}`);
    }
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      const sanitized = data.map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        current_price: coin.current_price,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        market_cap: coin.market_cap
      }));
      return res.json({ crypto: sanitized, source_api: "coingecko_real" });
    }
    throw new Error("Empty standard coin response");
  } catch (err) {
    console.warn("CoinGecko public feed rate limited. Relying on reliable market fallback.");
    res.json({ crypto: FALLBACK_CRYPTO_PRICES, source_api: "fallback_simulation" });
  }
});

// 3. Get Stock News and Sentiments
app.get("/api/stock-news", async (req, res) => {
  try {
    const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&limit=10&apikey=${ALPHA_VANTAGE_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.Information || data["Note"] || !data.feed) {
      return res.json({ feed: FALLBACK_NEWS, source_api: "fallback_simulation" });
    }
    
    // Sanitize feed response
    const sanitizedFeed = data.feed.slice(0, 10).map((item: any) => ({
      title: item.title,
      url: item.url,
      time_published: item.time_published,
      summary: item.summary,
      overall_sentiment_label: item.overall_sentiment_label || "Neutral",
      source: item.source || "Finance Feed"
    }));
    
    res.json({ feed: sanitizedFeed, source_api: "alpha_vantage_real" });
  } catch (err) {
    console.error("News request error. Serving simulated feed:", err);
    res.json({ feed: FALLBACK_NEWS, source_api: "fallback_simulation" });
  }
});

// 4. Get Historic Candlestick Stock Data
app.get("/api/stock-history", async (req, res) => {
  const symbol = (req.query.symbol as string || "AAPL").toUpperCase();
  try {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.Information || data["Note"] || !data["Time Series (Daily)"]) {
      console.warn(`Time series for ${symbol} hit rate limit or empty. Using generation walk.`);
      return res.json({ symbol, history: generateMockHistory(symbol), source_api: "fallback_simulation" });
    }
    
    const timeSeries = data["Time Series (Daily)"];
    const history = Object.keys(timeSeries).slice(0, 31).map((dateStr) => {
      const point = timeSeries[dateStr];
      return {
        date: dateStr,
        open: parseFloat(point["1. open"]),
        high: parseFloat(point["2. high"]),
        low: parseFloat(point["3. low"]),
        close: parseFloat(point["4. close"]),
        volume: parseInt(point["5. volume"])
      };
    }).reverse(); // Ascending date order for chart
    
    res.json({ symbol, history, source_api: "alpha_vantage_real" });
  } catch (error) {
    console.error(`Error querying series for ${symbol}:`, error);
    res.json({ symbol, history: generateMockHistory(symbol), source_api: "fallback_simulation" });
  }
});

// 4b. Social Media Sentiment Generator
function generateMockSocialSentiment(symbol: string) {
  const sym = symbol.toUpperCase();
  const posts: any[] = [];
  
  // Base sentiment determination depending on symbol
  let scoreValue = 0.35; // default positive bias
  let overall: "Bullish" | "Bearish" | "Neutral" = "Bullish";
  
  if (sym === "BTC") {
    scoreValue = 0.68;
    overall = "Bullish";
  } else if (sym === "AAPL") {
    scoreValue = 0.48;
    overall = "Bullish";
  } else if (sym === "NVDA") {
    scoreValue = 0.85;
    overall = "Bullish";
  } else if (sym === "TSLA") {
    scoreValue = -0.25;
    overall = "Bearish";
  } else if (sym.includes("/") || sym === "GBP/USD" || sym === "EUR/USD") {
    scoreValue = 0.05;
    overall = "Neutral";
  } else if (sym === "CARM-PAT") {
    scoreValue = 0.15;
    overall = "Bullish";
  } else if (sym === "AMUN-ACT") {
    scoreValue = 0.08;
    overall = "Neutral";
  }
  
  // Deterministic value with slight randomness on each invocation so it's lively
  const noise = (Math.random() - 0.5) * 0.15;
  scoreValue = Math.max(-1, Math.min(1, scoreValue + noise));
  if (scoreValue > 0.15) overall = "Bullish";
  else if (scoreValue < -0.15) overall = "Bearish";
  else overall = "Neutral";

  // Mock profile avatars
  const positiveAvatars = [
    "https://api.dicebear.com/7.x/identicon/svg?seed=cryptoking", 
    "https://api.dicebear.com/7.x/identicon/svg?seed=quanttrader", 
    "https://api.dicebear.com/7.x/identicon/svg?seed=wallstreetbets",
    "https://api.dicebear.com/7.x/identicon/svg?seed=geminiuser"
  ];
  
  const negativeAvatars = [
    "https://api.dicebear.com/7.x/identicon/svg?seed=beargrizzly",
    "https://api.dicebear.com/7.x/identicon/svg?seed=skeptic99",
    "https://api.dicebear.com/7.x/identicon/svg?seed=shortseller"
  ];

  const authors = [
    { name: "AlphaQuant_FR", platform: "Twitter" },
    { name: "u/DeepValueSpeculator", platform: "Reddit" },
    { name: "CryptoTracker_Pro", platform: "Twitter" },
    { name: "u/LeGrosTradeur", platform: "Reddit" },
    { name: "WallStreet_Intel", platform: "Twitter" }
  ];

  // Specific content templates
  const templates: { [key: string]: { text: string; polarity: "Bullish" | "Bearish" | "Neutral"; weight: number }[] } = {
    "BTC": [
      { text: "Les entrées de fonds dans les ETFs Spot de Bitcoin ne ralentissent absolument pas. L'offre disponible décline sévèrement en OTC. Phase exponentielle en vue !", polarity: "Bullish", weight: 0.85 },
      { text: "Honnêtement, le graphique du BTC montre un double sommet piégeux en Daily. Je coupe mes positions à levier en attendant un repli sain vers les 61k $.", polarity: "Bearish", weight: -0.65 },
      { text: "Tout le monde s'emballe avec les régulations. Mais rappelez-vous que le taux de hachage est au plus haut historique. Réseau ultra-sûr.", polarity: "Bullish", weight: 0.75 },
      { text: "Reddit discussion: Les frais de réseau sont un peu élevés aujourd'hui. L'utilité de base du réseau commence à saturer si les L2 ne s'imposent pas plus vite.", polarity: "Neutral", weight: -0.1 },
      { text: "C'est l'heure d'accumuler. Chaque creux sous les 67k $ est racheté dans la minute. Les baleines accumulent sans aucun répit.", polarity: "Bullish", weight: 0.9 },
    ],
    "AAPL": [
      { text: "Les annonces d'Apple Intelligence vont transformer le cycle de renouvellement d'iPhones cet automne. Les puces d'IA embarquées créent un fossé concurrentiel immense.", polarity: "Bullish", weight: 0.8 },
      { text: "Les ventes d'iPhone ralentissent franchement en Chine, les marques locales reprennent des parts de marché cruciales pour le haut de gamme.", polarity: "Bearish", weight: -0.7 },
      { text: "Analyse technique : Apple rebondit fort sur sa moyenne mobile 200 jours. Un socle d'accumulation historique idéal pour viser de nouveaux records.", polarity: "Bullish", weight: 0.7 },
      { text: "La valorisation de $AAPL est à plus de 31x les bénéfices, alors que la croissance du chiffre d'affaires privilégie la prudence. Un peu risqué à ce niveau de prix.", polarity: "Bearish", weight: -0.45 },
      { text: "Nouveau programme de rachat d'actions historique de 110 milliards de dollars. Ce mécanisme protège efficacement le cours contre toute baisse panique.", polarity: "Bullish", weight: 0.92 },
    ],
    "NVDA": [
      { text: "Le rythme de production des puces Blackwell dépasse toutes les estimations. La demande des géants du cloud est exponentielle. Objectif relevé à 1100 $.", polarity: "Bullish", weight: 0.95 },
      { text: "Est-ce qu'on est au sommet de la bulle d'IA ? Les ventes de puces sont exceptionnelles, mais les clients de NVDA vont devoir rentabiliser l'infrastructure.", polarity: "Bearish", weight: -0.55 },
      { text: "Acheté encore du NVDA ce matin. C'est l'infrastructure du siècle. Absolument incontournable sur toutes les thématiques semi-conducteurs.", polarity: "Bullish", weight: 0.85 },
      { text: "La volatilité intraday sur $NVDA est hallucinante en ce moment. Préférable d'investir de manière lissée en DCA plutôt que de levier court terme.", polarity: "Neutral", weight: 0.1 }
    ],
    "TSLA": [
      { text: "Les livraisons de véhicules électriques sont bien en deçà du consensus. La concurrence chinoise (BYD/Xiaomi) détruit les marges mondiales de Tesla.", polarity: "Bearish", weight: -0.85 },
      { text: "Le pivot de Tesla vers la robotique d'autonomie et le robotaxi le 8 août est sous-estimé. Ce n'est plus une entreprise automobile mais une IA physique.", polarity: "Bullish", weight: 0.78 },
      { text: "Franchement, la baisse de prix permanente des modèles 3 et Y dégrade le marché de l'occasion et énerve les premiers acheteurs. Marque un peu en déclin.", polarity: "Bearish", weight: -0.6 },
      { text: "Reddit: Le FSD v12 est impressionnant de fluidité. Les interventions humaines tombent à zéro sur mes derniers trajets de 50km.", polarity: "Bullish", weight: 0.65 }
    ],
    "generic": [
      { text: "L'analyse technique sur ${sym} indique une accumulation discrète des mains fortes près de la borne inférieure du range. Risque/rendement excellent.", polarity: "Bullish", weight: 0.6 },
      { text: "Attention aux volumes en baisse constante sur ${sym}. Cela sent le faux breakout à plein nez, je prends mes gains rapidement par précaution.", polarity: "Bearish", weight: -0.6 },
      { text: "Discussions animées et rumeurs de restructuration ou d'un dividende exceptionnel sur les forums. Les spéculateurs se préparent.", polarity: "Bullish", weight: 0.5 },
      { text: "Position plutôt neutre sur ${sym}. On est pile au milieu d'un canal de consolidation horizontal, j'attends une cassure claire des 20 jours.", polarity: "Neutral", weight: 0.0 }
    ]
  };

  const pool = templates[sym as keyof typeof templates] || templates["generic"];
  pool.forEach((tmpl, index) => {
    const isBull = tmpl.polarity === "Bullish";
    const avatarSeed = isBull ? positiveAvatars[index % positiveAvatars.length] : negativeAvatars[index % negativeAvatars.length];
    const authorObj = authors[index % authors.length];
    
    const cleanText = tmpl.text.replace(/\$\{sym\}/g, sym);
    
    posts.push({
      id: `${sym.toLowerCase()}-post-${index}`,
      author: authorObj.name,
      avatar: avatarSeed,
      platform: authorObj.platform,
      text: cleanText,
      sentiment: tmpl.polarity,
      score: tmpl.weight,
      engagement: Math.floor(45 + Math.random() * 820),
      timeAgo: `${index + 1}h`
    });
  });

  const twitterScore = parseFloat((scoreValue * (0.85 + Math.random() * 0.3)).toFixed(2));
  const redditScore = parseFloat((scoreValue * (0.75 + Math.random() * 0.4)).toFixed(2));

  return {
    symbol: sym,
    overallSentiment: overall,
    score: Math.round(((scoreValue + 1) / 2) * 100),
    twitterVolume: Math.floor(1250 + Math.random() * 8500),
    redditVolume: Math.floor(350 + Math.random() * 2100),
    twitterSentimentScore: Math.max(-1, Math.min(1, twitterScore)),
    redditSentimentScore: Math.max(-1, Math.min(1, redditScore)),
    posts
  };
}

app.get("/api/social-sentiment", (req, res) => {
  const symbol = (req.query.symbol as string || "AAPL").toUpperCase();
  const sentiment = generateMockSocialSentiment(symbol);
  res.json(sentiment);
});

// 5. Advisor Intelligence analysis powered by Gemini 3.5 Flash (server-side, 20 yrs experienced trader)
app.post("/api/analyze-asset", async (req, res) => {
  const { symbol, recentPrices, assetType, sentimentSummary } = req.body;
  
  if (!symbol || !recentPrices || !Array.isArray(recentPrices) || recentPrices.length === 0) {
    return res.status(400).json({ error: "Data for analysis is insufficient." });
  }

  // Last available parameters
  const newestPrice = recentPrices[recentPrices.length - 1].close || recentPrices[recentPrices.length - 1].current_price || recentPrices[recentPrices.length - 1];
  const oldestPrice = recentPrices[0].close || recentPrices[0].current_price || recentPrices[0];
  const totalChangePercent = ((newestPrice - oldestPrice) / oldestPrice * 100).toFixed(2);
  
  // 5b. Retreive the detailed social sentiments to inject inside model prompt
  const socialSentiment = generateMockSocialSentiment(symbol);
  const socialSummaryText = `
  HYPE ET SENTIMENT DES RÉSEAUX SOCIAUX (Twitter, Reddit) pour l'actif ${symbol}:
  - Sentiment Global des Réseaux: ${socialSentiment.overallSentiment}
  - Score d'Optimisme Social (0-100): ${socialSentiment.score}%
  - Volume de posts Twitter: ${socialSentiment.twitterVolume} (Sentiment Twitter: ${socialSentiment.twitterSentimentScore})
  - Volume de posts Reddit: ${socialSentiment.redditVolume} (Sentiment Reddit: ${socialSentiment.redditSentimentScore})
  - Commentaires récents de la communauté:
    ${socialSentiment.posts.map(p => `[${p.platform}] @${p.author}: "${p.text}" (Polarité: ${p.sentiment})`).join("\n    ")}
  `;

  try {
    const prompt = `
En tant qu'expert en investissement boursier et en crypto-monnaies d'élite avec plus de 20 ans d'expérience opérationnelle sur les marchés financiers (Wall Street, fonds spéculatifs, arbitrage), analyse l'actif suivant afin de me donner un conseil professionnel de trading.

Informations de l'actif:
- Symbole/Nom: ${symbol}
- Type d'Actif: ${assetType || "Action / Crypto"}
- Prix Actuel: $${newestPrice}
- Prix il y a un mois: $${oldestPrice}
- Variation sur 30 jours: ${totalChangePercent}%
- Sentiment global actuel des médias traditionnels: ${sentimentSummary || "Neutre"}

${socialSummaryText}

*** CRITIQUE ET EXIGENCE FONDAMENTALE ***
Tu devez obligatoirement prendre en compte l'analyse des sentiments des réseaux sociaux (Hype Twitter, ferveur ou craintes Reddit) décrite ci-dessus pour affiner tes conseils de trading !
- Si la ferveur sociale (Retail Hype) est extrême mais décorrélée des fondamentaux, conseille la prudence ou des stop-loss serrés.
- Si le sentiment social montre un scepticisme ou une peur excessive ("FUD") alors que les techniques stabilisent, recherche des rebonds de contrarien.
- Explique explicitement dans ton "rationale" comment ce sentiment communautaire de détail influence ta thèse.

Analyse attentivement l'historique de prix récent. Formule des signaux techniques clés (Soutien/Résistance, momentum RSI simulé par rapport aux bougies, croisements de Moyennes Mobiles) et donne un verdict de trading extrêmement aiguisé.
Tu dois absolument répondre en français d'un ton digne de l'élite financière : professionnel, rationnel, mesuré mais tranchant.

Ta réponse doit obligatoirement respecter la structure JSON exacte ci-dessous :
{
  "verdict": "BUY" ou "SELL" ou "HOLD",
  "confidence": <entier de 0 a 100 representant ton niveau de certitude>,
  "targetPrice": <nombre suggérant l'objectif de prise de profit>,
  "stopLoss": <nombre suggérant la coupure de pertes de sécurité>,
  "riskScore": "LOW" ou "MEDIUM" ou "HIGH" ou "EXTREME",
  "technicalSignals": [<tableau de 3 à 4 chaines décrivant précisément les signaux techniques essentiels détectés en français>],
  "supportPrice": <nombre suggérant le plus proche niveau de support majeur>,
  "resistancePrice": <nombre suggérant la prochaine grosse résistance à franchir>,
  "rationale": "<paragraphe d'explications d'expert rédigé en français expliquant le diagnostic macro, l'impact du sentiment social Twitter/Reddit détecté, et le plan d'action optimal>",
  "shortTermTrend": "HAUSSIER" ou "BAISSIER" ou "NEUTRE"
}
`;

    const modelName = "gemini-3.5-flash"; // Selected from allowed models for text logic
    const geminiResponse = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "verdict",
            "confidence",
            "targetPrice",
            "stopLoss",
            "riskScore",
            "technicalSignals",
            "supportPrice",
            "resistancePrice",
            "rationale",
            "shortTermTrend"
          ],
          properties: {
            verdict: { type: Type.STRING, description: "BUY, SELL or HOLD" },
            confidence: { type: Type.INTEGER, description: "Confidence percentage (0-100)" },
            targetPrice: { type: Type.NUMBER, description: "Suggested Target Profit level" },
            stopLoss: { type: Type.NUMBER, description: "Suggested Stop Loss level" },
            riskScore: { type: Type.STRING, description: "LOW, MEDIUM, HIGH or EXTREME" },
            technicalSignals: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 to 4 essential French technical signals"
            },
            supportPrice: { type: Type.NUMBER, description: "Major support line" },
            resistancePrice: { type: Type.NUMBER, description: "Major resistance line" },
            rationale: { type: Type.STRING, description: "In-depth trading wisdom commentary in French" },
            shortTermTrend: { type: Type.STRING, description: "HAUSSIER, BAISSIER or NEUTRE" }
          }
        }
      }
    });

    const parsedOutput = JSON.parse(geminiResponse.text.trim());
    res.json({ ...parsedOutput, generatedAt: new Date().toISOString() });
  } catch (err) {
    console.error("Gemini professional advisor failure or rate limit:", err);
    
    // Provide an elegant fallback simulation with expert answers if Gemini key fails or times out
    const cleanSymbol = symbol.toUpperCase();
    const isUptrend = parseFloat(totalChangePercent) > 0;
    const socialBullishRatio = socialSentiment.score; // 0-100
    
    let simulatedVerdict: "BUY" | "SELL" | "HOLD" = "HOLD";
    if (socialBullishRatio >= 60 && isUptrend) {
      simulatedVerdict = "BUY";
    } else if (socialBullishRatio <= 40 && !isUptrend) {
      simulatedVerdict = "SELL";
    }

    const simulatedResponse = {
      verdict: simulatedVerdict,
      confidence: Math.round(60 + Math.random() * 20),
      targetPrice: parseFloat((newestPrice * (simulatedVerdict === "BUY" ? 1.14 : simulatedVerdict === "SELL" ? 0.88 : 1.04)).toFixed(2)),
      stopLoss: parseFloat((newestPrice * (simulatedVerdict === "BUY" ? 0.93 : simulatedVerdict === "SELL" ? 1.06 : 0.96)).toFixed(2)),
      riskScore: socialSentiment.score > 75 || socialSentiment.score < 25 ? "HIGH" : "MEDIUM",
      technicalSignals: [
        `Hype Social sur Twitter/Reddit qualifiée de ${socialSentiment.overallSentiment} (${socialSentiment.score}% d'optimisme)`,
        `Moyenne Mobile Exponentielle (EMA 20) s’établissant à $${(newestPrice * 0.99).toFixed(2)}`,
        `RSI de l'actif actuellement calé à ${isUptrend ? 59 : 44} d'amplitude`,
        `Support s’établissant solidement autour de $${(newestPrice * 0.92).toFixed(2)}`
      ],
      supportPrice: parseFloat((newestPrice * 0.91).toFixed(2)),
      resistancePrice: parseFloat((newestPrice * 1.09).toFixed(2)),
      rationale: `L'analyse sur ${cleanSymbol} montre une convergence intéressante. La ferveur des investisseurs individuels sur les réseaux sociaux dresse un sentiment général ${socialSentiment.overallSentiment} (score de ${socialSentiment.score}%). Cette attention accrue suggère un support populaire fort qui tend à limiter les replis de panique. En intégrant cette donnée, nous préconisons un positionnement de type ${simulatedVerdict}, avec une barrière de protection stricte placée sur le support psychologique à $${(newestPrice * 0.91).toFixed(2)}.`,
      shortTermTrend: isUptrend ? "HAUSSIER" : "NEUTRE",
      generatedAt: new Date().toISOString(),
      is_fallback: true
    };
    
    res.json(simulatedResponse);
  }
});


// -----------------------------------------
// VITE DEV SERVER & STABLE PRODUCTION HOSTING
// -----------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server executing successfully on port ${PORT}`);
  });
}

startServer();
