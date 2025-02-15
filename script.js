window.onload = function () {
    // Fetch the CSV file and parse it
    Papa.parse("merged_results.csv", {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: function (results) {
            console.log(results);  // Check if results are correctly parsed
            processData(results.data);
        },
        error: function (error) {
            console.error("Error parsing CSV:", error);  // Log any parsing error
        }
    });

    // Function to process the data and display the plot
    function processData(data) {
        console.log(data);  // Check if the data is in the correct format

        // Extract all years from the data
        const years = data.map(item => item.year);
        
        // Get unique years and sort them
        const uniqueYears = [...new Set(years)].sort((a, b) => a - b);
        
        // Count the instances by year
        const yearCount = uniqueYears.map(year => {
            return {
                year: year,
                count: years.filter(y => y === year).length
            };
        });

        // Prepare the data for the plot
        const labels = yearCount.map(item => item.year);
        const counts = yearCount.map(item => item.count);

        console.log("Labels:", labels);
        console.log("Counts:", counts);

        // Create the plot if there is valid data
        if (labels.length > 0 && counts.length > 0) {
            const ctx = document.getElementById('chart').getContext('2d');
            new Chart(ctx, {
                type: 'line',  // Change to line plot
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Number of Publications',
                        data: counts,
                        borderColor: 'purple',
                        backgroundColor: 'rgba(54, 162, 235, 0)',  // Transparent fill
                        borderWidth: 2,
                        pointBackgroundColor: 'orange',  // Markers color
                        pointBorderColor: 'orange',  // Marker border color
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        tension: 0.3,  // Smooth line
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                display: true,
                                color: 'rgba(0, 0, 0, 0.1)',
                                lineWidth: 1,
                                borderDash: [5, 5]
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function (tooltipItem) {
                                    return tooltipItem.raw;  // Display the count in tooltip
                                }
                            }
                        }
                    }
                },
                plugins: [{
                    beforeDraw: function(chart) {
                        let ctx = chart.ctx;
                        let dataset = chart.data.datasets[0];
                        // Draw the count annotations on each data point
                        dataset.data.forEach((point, index) => {
                            ctx.save();
                            const x = chart.scales.x.getPixelForValue(dataset.data[index]);
                            const y = chart.scales.y.getPixelForValue(point);
                            ctx.fillStyle = 'gray';
                            ctx.font = '14px Arial';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'bottom';
                            ctx.fillText(point, x, y - 5); // Display count slightly above the point
                            ctx.restore();
                        });
                    }
                }]
            });
        }
    }
};
