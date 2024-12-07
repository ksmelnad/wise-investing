const Features = () => {
  const featuresItems = [
    {
      name: "Comprehensive Market Data Collection",
      description:
        "Access up-to-date market data for companies worldwide, all in one place.",
    },
    {
      name: "Ethical and Environmental Profiling",
      description:
        "Analyze companies based on their business nature and sustainability practices.",
    },
    {
      name: "Association Analysis",
      description:
        "Uncover connections between companies and their investments in ethically questionable industries.",
    },
    {
      name: "Interactive Visualizations",
      description:
        "Understand complex data through intuitive graphs and charts.",
    },
  ];
  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-center py-4">Features</h1>
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {featuresItems.map((item) => (
            <div key={item.name} className="p-4">
              <h2 className="text-lg font-bold">{item.name}</h2>
              <p className="text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
