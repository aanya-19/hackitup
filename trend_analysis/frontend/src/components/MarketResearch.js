import React, { useState, useRef } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Register chart types
Chart.register(...registerables);

const MarketResearch = () => {
  const [keyword, setKeyword] = useState("");
  const [trendData, setTrendData] = useState(null);
  const [error, setError] = useState("");
  const chartRef = useRef(null); // Reference for capturing the chart

  const fetchMarketData = async () => {
    if (!keyword) return;
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/market_research?keyword=${encodeURIComponent(keyword)}`
      );

      console.log("Full API Response:", response.data);
      const trendData = response.data[keyword]; // Dynamically extract based on keyword

      if (!trendData) {
        setError(`No data found for ${keyword}.`);
        return;
      }

      setTrendData(trendData);
      setError("");
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("No data found or an error occurred.");
    }
  };

  // Function to download the graph as a PDF
  const downloadPDF = () => {
    if (!chartRef.current) return;

    html2canvas(chartRef.current, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = 190; // A4 width
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 10, 10, pdfWidth, pdfHeight);
      pdf.save("market_trends.pdf");
    });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>AI-Powered Market Research</h2>

      <div style={styles.inputContainer}>
        <input
          type="text"
          placeholder="Enter keyword (e.g., AI fitness)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={styles.input}
        />
        <button onClick={fetchMarketData} style={styles.button}>Analyze Market</button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {/* Trend Over Time Chart */}
      {trendData && Object.keys(trendData).length > 0 && (
        <div ref={chartRef} style={styles.chartContainer}>
          <h3>Trend Over Time</h3>
          <Line
            data={{
              labels: Object.keys(trendData), // Dates
              datasets: [
                {
                  label: "Search Interest",
                  data: Object.values(trendData), // Values
                  borderColor: "blue",
                  borderWidth: 2,
                  fill: false,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false, // Prevent shrinking
            }}
          />
        </div>
      )}

      {/* Download PDF Button */}
      {trendData && (
        <button onClick={downloadPDF} style={styles.downloadButton}>
          Download PDF
        </button>
      )}
    </div>
  );
};

// Inline CSS for better UI
const styles = {
  container: {
    textAlign: "center",
    maxWidth: "900px",
    margin: "auto",
    padding: "20px",
  },
  heading: {
    fontSize: "24px",
    marginBottom: "20px",
  },
  inputContainer: {
    marginBottom: "20px",
  },
  input: {
    padding: "10px",
    width: "250px",
    marginRight: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px 15px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  error: {
    color: "red",
  },
  chartContainer: {
    width: "100%",
    height: "400px", // Prevent shrinking
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "20px",
  },
  downloadButton: {
    display: "block",
    margin: "20px auto",
    padding: "10px 20px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default MarketResearch;
