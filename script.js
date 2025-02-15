window.onload = function () {
    // Fetch the CSV file and parse it
    Papa.parse("merged_results.csv", {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: function (results) {
            processData(results.data);
        },
        error: function (error) {
            console.error("Error parsing CSV:", error);
        }
    });

    function processData(data) {
        // Extract valid years
        const years = data.map(item => {
            const year = item.year;
            return year && !isNaN(year) ? Number(year) : null;
        }).filter(year => year !== null);

        // Get unique years and sort them
        const uniqueYears = [...new Set(years)].sort((a, b) => a - b);

        // Count occurrences per year
        const yearCount = uniqueYears.map(year => ({
            year: year,
            count: years.filter(y => y === year).length
        }));

        // Prepare data for the chart
        const labels = yearCount.map(item => item.year);
        const counts = yearCount.map(item => item.count);

        if (labels.length > 0 && counts.length > 0) {
            const ctx = document.getElementById('chart').getContext('2d');
            const chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Count by Year',
                        data: counts,
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,  // Allow resizing
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

                            // Filter data for the clicked year
                            const groupData = data.filter(item => item.year === clickedYear);
                            const groupCount = countGroupValues(groupData);

                            // Display group list
                            displayGroupList(groupCount, clickedYear);
                        }
                    }
                }
            });
        } else {
            console.error("No valid data available for plotting.");
        }
    }

    function countGroupValues(groupData) {
        const groupCount = {};
        groupData.forEach(item => {
            const groupValue = item.group;
            if (groupValue) {
                groupCount[groupValue] = (groupCount[groupValue] || 0) + 1;
            }
        });
        return groupCount;
    }

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
