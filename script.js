window.onload = function () {
    // Fetch the CSV file and parse it
    Papa.parse("scholar_results.csv", {
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
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Count by Year',
                        data: counts,
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }
};
