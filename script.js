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
        const years = data.map(item => item.year).filter(year => year && !isNaN(year)).map(Number);
        const uniqueYears = [...new Set(years)].sort((a, b) => a - b);

        const yearCount = uniqueYears.map(year => ({
            year: year,
            count: years.filter(y => y === year).length
        }));

        if (yearCount.length > 0) {
            const ctx = document.getElementById('chart').getContext('2d');
            const chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: yearCount.map(item => item.year),
                    datasets: [{
                        label: 'Count by Year',
                        data: yearCount.map(item => item.count),
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true } },
                    onClick: function (e) {
                        const activePoints = chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
                        if (activePoints.length > 0) {
                            const clickedYear = yearCount[activePoints[0].index].year;
                            displayGroupList(getGroupData(data, clickedYear), clickedYear);
                        }
                    }
                }
            });
        } else {
            console.error("No valid data available for plotting.");
        }
    }

    function getGroupData(data, year) {
        const groupData = {};
        data.filter(item => item.year === year).forEach(item => {
            if (!groupData[item.group]) {
                groupData[item.group] = { count: 0, sub_groups: {} };
            }
            groupData[item.group].count += 1;

            if (!groupData[item.group].sub_groups[item.sub_group]) {
                groupData[item.group].sub_groups[item.sub_group] = { count: 0, instances: [] };
            }
            groupData[item.group].sub_groups[item.sub_group].count += 1;
            groupData[item.group].sub_groups[item.sub_group].instances.push({
                title: item.title || "No Title",
                authors: item.authors || "Unknown Authors",
                url: item.url || "#"
            });
        });
        return groupData;
    }

    function displayGroupList(groupData, year) {
        const groupListDiv = document.getElementById('group-list');
        groupListDiv.innerHTML = `<h2>Publications for ${year}:</h2>`;

        const list = document.createElement('ul');
        Object.entries(groupData).forEach(([group, data]) => {
            const groupItem = document.createElement('li');
            groupItem.innerHTML = `<strong>${group}</strong> (${data.count})`;
            groupItem.style.cursor = "pointer";
            groupItem.style.color = "black";
            groupItem.addEventListener("click", function () {
                toggleSubGroups(groupItem, data.sub_groups);
            });

            list.appendChild(groupItem);
        });

        groupListDiv.appendChild(list);
    }

    function toggleSubGroups(groupItem, subGroups) {
        let existingList = groupItem.querySelector("ul");
        if (existingList) {
            existingList.remove(); // Collapse
        } else {
            const subGroupList = document.createElement('ul');
            subGroupList.style.marginLeft = "20px";

            Object.entries(subGroups).forEach(([subGroup, data]) => {
                const subGroupItem = document.createElement('li');
                subGroupItem.innerHTML = `<strong>${subGroup}</strong> (${data.count})`;
                subGroupItem.style.cursor = "pointer";
                subGroupItem.style.color = "black";
                subGroupItem.addEventListener("click", function () {
                    toggleInstances(subGroupItem, data.instances);
                });

                subGroupList.appendChild(subGroupItem);
            });

            groupItem.appendChild(subGroupList);
        }
    }

    function toggleInstances(subGroupItem, instances) {
        let existingList = subGroupItem.querySelector("ul");
        if (existingList) {
            existingList.remove(); // Collapse
        } else {
            const instanceList = document.createElement('ul');
            instanceList.style.marginLeft = "20px";

            instances.forEach(instance => {
                const instanceItem = document.createElement('li');
                instanceItem.innerHTML = `<strong>${instance.title}</strong> - ${instance.authors} - <a href="${instance.url}" target="_blank">[Link]</a>`;
                instanceItem.style.fontSize = "14px";
                instanceItem.style.marginBottom = "5px";
                instanceList.appendChild(instanceItem);
            });

            subGroupItem.appendChild(instanceList);
        }
    }
};
