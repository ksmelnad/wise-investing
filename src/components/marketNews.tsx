"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const MarketNews = () => {
  const { data, error } = useSWR(
    `https://financialmodelingprep.com/api/v3/stock_news?limit=5&apikey=${process.env.NEXT_PUBLIC_FMP_API_KEY}`,
    fetcher
  );

  if (error) return <p>Error loading news...</p>;
  if (!data) return <p>Loading...</p>;

  return (
    <div className="p-6 bg-white shadow-md rounded-md">
      <h2 className="text-xl font-semibold mb-4">Market News</h2>
      <ul className="space-y-4">
        {data.map((news: any) => (
          <li key={news.title}>
            <a
              href={news.url}
              target="_blank"
              className="text-blue-500 underline"
            >
              {news.title}
            </a>
            <p className="text-sm text-gray-600">{news.publishedDate}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MarketNews;
