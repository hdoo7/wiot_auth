window.onload = function () {
    // Fetch the CSV file and parse it
    Papa.parse("merged_results.csv", {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: function (results) {
            console.log("Parsed Data:", results.data);  // Check the raw parsed data
            processData(results.data);
        },
        error: function (error) {
            console.error("Error parsing CSV:", error);  // Log any parsing error
        }
    });

    // Function to process the data and display the plot
    function processData(data) {
        console.log("Processing Data:", data);  // Check the raw data

        // Extract all years from the data
        const years = data.map(item => {
            const year = item.year;
            return year && !isNaN(year) ? Number(year) : null;  // Ensure valid year data
        }).filter(year => year !== null);  // Filter out invalid years
        console.log("Extracted Years:", years);  // Log extracted years

        // Get unique years and sort them
        const uniqueYears = [...new Set(years)].sort((a, b) => a - b);
        console.log("Unique Years:", uniqueYears);  // Log unique years

        // Count the instances by year
        const yearCount = uniqueYears.map(year => {
            return {
                year: year,
                count: years.filter(y => y === year).length
            };
        });
        console.log("Year Count:", yearCount);  // Log the year count data

        // Prepare the data for the plot
        const labels = yearCount.map(item => item.year);
        const counts = yearCount.map(item => item.count);

        console.log("Labels:", labels);  // Check the labels for the x-axis
        console.log("Counts:", counts);  // Check the counts for the y-axis

        // Create the line chart
        if (labels.length > 0 && counts.length > 0) {
            const ctx = document.getElementById('chart').getContext('2d');
            new Chart(ctx, {
                type: 'line',  // Change chart type to 'line'
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Count by Year',
                        data: counts,
                        borderColor: 'purple',  // Line color
                        backgroundColor: 'rgba(0,0,0,0)',  // Transparent fill
                        borderWidth: 2,
                        tension: 0.4,  // Smooth curve
                        pointStyle: 'circle',  // Markers as circles
                        pointRadius: 6,
                        pointBackgroundColor: 'orange',  // Marker color
                        pointBorderWidth: 2,
                        pointHoverBackgroundColor: 'yellow',  // Hover color for markers
                        pointHoverBorderWidth: 2,
                        fill: false,  // Do not fill under the line
                        showLine: true,  // Display the line
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Year',
                                font: { size: 16 }
                            },
                            ticks: {
                                font: { size: 14 },
                                autoSkip: true,  // Auto skip ticks to prevent crowding
                                maxRotation: 0,
                                minRotation: 0,
                                align: 'end'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Number of Publications',
                                font: { size: 16 }
                            },
                            beginAtZero: true,
                            ticks: {
                                font: { size: 14 },
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    return context.raw + ' publications';  // Custom tooltip formatting
                                }
                            }
                        }
                    },
                    elements: {
                        line: {
                            tension: 0.4,  // Smooth line curve
                        }
                    },
                    animation: {
                        duration: 1000,  // Animation duration
                        easing: 'easeOutBounce'
                    },
                    layout: {
                        padding: {
                            top: 20,
                            right: 20,
                            bottom: 20,
                            left: 20
                        }
                    },
                    // Adding gridlines for better visual alignment
                    scales: {
                        y: {
                            grid: {
                                display: true,
                                drawBorder: false,
                                borderColor: 'rgba(0, 0, 0, 0.1)',
                                lineWidth: 1,
                            }
                        }
                    }
                }
            });
        } else {
            console.error("No valid data available for plotting.");
        }
    }
};
