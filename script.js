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
                            displayGroupList(groupCount, clickedYear, data);
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
                        groupCount[groupValue].sub_groups[subGroupValue] = { count: 0, instances: [] };
                    }
                    groupCount[groupValue].sub_groups[subGroupValue].count += 1;

                    groupCount[groupValue].sub_groups[subGroupValue].instances.push({
                        title: item.title || "No Title",
                        authors: item.authors || "Unknown Authors",
                        url: item.url || "#"
                    });
                }
            }
        });

        return groupCount;
    }

    function displayGroupList(groupCount, year, data) {
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

            Object.entries(subGroups).forEach(([subGroup, data]) => {
                const subGroupItem = document.createElement('li');
                subGroupItem.innerHTML = `<strong>${subGroup}</strong>: ${data.count}`;
                subGroupItem.style.cursor = "pointer";
                subGroupItem.style.color = "darkgreen";
                subGroupItem.addEventListener("click", function () {
                    toggleInstances(subGroup, data.instances, this);
                });

                subGroupList.appendChild(subGroupItem);
            });

            groupItem.appendChild(subGroupList);
        }
    }

    function toggleInstances(subGroup, instances, subGroupItem) {
        let existingList = subGroupItem.querySelector("ul");

        if (existingList) {
            subGroupItem.removeChild(existingList); // Collapse if already expanded
        } else {
            const instanceList = document.createElement('ul');
            instanceList.style.marginLeft = "20px";

            instances.forEach(instance => {
                const instanceItem = document.createElement('li');
                instanceItem.innerHTML = `<strong>${instance.title}</strong> - ${instance.authors} - <a href="${instance.url}" target="_blank">Link</a>`;
                instanceList.appendChild(instanceItem);
            });

            subGroupItem.appendChild(instanceList);
        }
    }
};
