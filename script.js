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
            const chart = new Chart(ctx, {
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
                    maintainAspectRatio: false,  // Allow manual size control
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    onClick: function (e) {
                        const activePoints = chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
                        if (activePoints.length > 0) {
                            const clickedIndex = activePoints[0].index;
                            const clickedYear = labels[clickedIndex];

                            // Filter the data for the clicked year and get unique values from the "group" column
                            const groupData = data.filter(item => item.year === clickedYear);
                            const groupCount = countGroupValues(groupData);

                            // Display the list of group values and their counts
                            displayGroupList(groupCount, clickedYear);
                        }
                    }
                }
            });
        } else {
            console.error("No valid data available for plotting.");
        }
    }

    // Function to count occurrences of unique values in the "group" column
    function countGroupValues(groupData) {
        const groupCount = {};

        groupData.forEach(item => {
            const groupValue = item.group;
            if (groupValue) {
                if (!groupCount[groupValue]) {
                    groupCount[groupValue] = 1;
                } else {
                    groupCount[groupValue]++;
                }
            }
        });

        return groupCount;
    }

    // Function to display the group list on the webpage
    function displayGroupList(groupCount, year) {
        const groupListDiv = document.getElementById('group-list');
        groupListDiv.innerHTML = `<h2>Group Counts for Year ${year}:</h2>`;

        const list = document.createElement('ul');
        for (const [group, count] of Object.entries(groupCount)) {
            const listItem = document.createElement('li');
            listItem.textContent = `${group}: ${count}`;
            list.appendChild(listItem);
        }

        groupListDiv.appendChild(list);
    }
};
