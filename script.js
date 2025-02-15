window.onload = function () {
    // Fetch the CSV file and parse it
    Papa.parse("scholar_results.csv", {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: function (results) {
            processData(results.data);
        }
    });

    // Function to process the data and display the plot
    function processData(data) {
        // Extract years and count the instances by year
        const yearCount = {};
        
        data.forEach(item => {
            const year = item.year;
            if (yearCount[year]) {
                yearCount[year]++;
            } else {
                yearCount[year] = 1;
            }
        });

        // Prepare data for the plot
        const years = Object.keys(yearCount);
        const counts = Object.values(yearCount);

        // Create the plot
        const ctx = document.getElementById('chart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: years,
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
};
