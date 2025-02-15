window.onload = function () {
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
        const years = data.map(item => {
            const year = item.year;
            return year && !isNaN(year) ? Number(year) : null;
        }).filter(year => year !== null);

        const uniqueYears = [...new Set(years)].sort((a, b) => a - b);
        const yearCount = uniqueYears.map(year => ({
            year: year,
            count: years.filter(y => y === year).length
        }));

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
                    maintainAspectRatio: false,
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

                            const groupData = data.filter(item => item.year === clickedYear);
                            const groupCount = countGroupValues(groupData);
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
            const subGroupValue = item.sub_group;

            if (groupValue) {
                if (!groupCount[groupValue]) {
                    groupCount[groupValue] = { count: 0, sub_groups: {} };
                }
                groupCount[groupValue].count += 1;

                if (subGroupValue) {
                    if (!groupCount[groupValue].sub_groups[subGroupValue]) {
                        groupCount[groupValue].sub_groups[subGroupValue] = 0;
                    }
                    groupCount[groupValue].sub_groups[subGroupValue] += 1;
                }
            }
        });

        return groupCount;
    }

    function displayGroupList(groupCount, year) {
        const groupListDiv = document.getElementById('group-list');
        groupListDiv.innerHTML = `<h2>Group Counts for Year ${year}:</h2>`;

        const list = document.createElement('ul');

        Object.entries(groupCount).forEach(([group, data]) => {
            const groupItem = document.createElement('li');
            groupItem.innerHTML = `<strong>${group}</strong>: ${data.count}`;
            groupItem.style.cursor = "pointer";
            groupItem.style.color = "blue";
            groupItem.addEventListener("click", function () {
                toggleSubGroups(group, data.sub_groups, this);
            });

            list.appendChild(groupItem);
        });

        groupListDiv.appendChild(list);
    }

    function toggleSubGroups(group, subGroups, groupItem) {
        let existingList = groupItem.querySelector("ul");

        if (existingList) {
            groupItem.removeChild(existingList); // Collapse if already expanded
        } else {
            const subGroupList = document.createElement('ul');
            subGroupList.style.marginLeft = "20px";

            Object.entries(subGroups).forEach(([subGroup, count]) => {
                const subGroupItem = document.createElement('li');
                subGroupItem.textContent = `${subGroup}: ${count}`;
                subGroupList.appendChild(subGroupItem);
            });

            groupItem.appendChild(subGroupList);
        }
    }
};
