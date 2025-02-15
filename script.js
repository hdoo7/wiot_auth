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

        // Create the plot if there is valid data
        if (labels.length > 0 && counts.length > 0) {
            const ctx = document.getElementById('chart').getContext('2d');
            new Chart(ctx, {
                type: 'line',  // Explicitly set chart type to 'line'
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Count by Year',
                        data: counts,
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 2,
                        fill: true,
                        pointStyle: 'circle',  // Style the points on the line
                        pointRadius: 6,  // Make the points larger
                        pointBackgroundColor: 'orange',  // Orange dots
                        pointBorderWidth: 2,
                        tension: 0.4  // Smooth the line
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        },
                        x: {
                            ticks: {
                                autoSkip: true,
                                maxTicksLimit: 20
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(tooltipItem) {
                                    return tooltipItem.raw;  // Show the count in the tooltip
                                }
                            }
                        },
                        datalabels: {
                            anchor: 'end',
                            align: 'top',
                            formatter: function(value) {
                                return value;  // Display count as the label
                            },
                            color: 'gray',
                            font: {
                                weight: 'bold',
                                size: 14
                            },
                            offset: 10
                        }
                    }
                }
            });
        } else {
            console.error("No valid data available for plotting.");
        }
    }
};
