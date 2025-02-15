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
                        backgroundColor: 'rgba(75, 192, 192, 0.8)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 2,
                        borderRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true } },
                    plugins: {
                        legend: {
                            labels: {
                                font: {
                                    size: 14,
                                    weight: 'bold'
                                },
                                color: '#333'
                            }
                        }
                    },
                    animation: {
                        duration: 1000,
                        easing: 'easeInOutQuad'
                    },
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

    function displayGroupList(groupData, year) {
        const groupListDiv = document.getElementById('group-list');
        groupListDiv.innerHTML = `<h2 style="color: #222; font-family: Arial, sans-serif; text-align: center;">Publications for ${year}:</h2>`;

        const list = document.createElement('ul');
        list.style.listStyleType = "none";
        list.style.padding = "0";

        Object.entries(groupData).forEach(([group, data]) => {
            const groupItem = document.createElement('li');
            groupItem.innerHTML = `<strong style="color: #444; font-size: 18px;">${group}</strong> (${data.count})`;
            groupItem.style.cursor = "pointer";
            groupItem.style.padding = "10px";
            groupItem.style.margin = "6px 0";
            groupItem.style.backgroundColor = "#f1f1f1";
            groupItem.style.borderRadius = "8px";
            groupItem.style.transition = "background-color 0.3s ease";
            groupItem.onmouseover = () => groupItem.style.backgroundColor = "#e0e0e0";
            groupItem.onmouseout = () => groupItem.style.backgroundColor = "#f1f1f1";
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
            existingList.remove();
        } else {
            const subGroupList = document.createElement('ul');
            subGroupList.style.marginLeft = "15px";
            subGroupList.style.padding = "8px";
            subGroupList.style.listStyleType = "none";

            Object.entries(subGroups).forEach(([subGroup, data]) => {
                const subGroupItem = document.createElement('li');
                subGroupItem.innerHTML = `<strong>${subGroup}</strong> (${data.count})`;
                subGroupItem.style.cursor = "pointer";
                subGroupItem.style.padding = "8px";
                subGroupItem.style.margin = "4px 0";
                subGroupItem.style.backgroundColor = "#d6e0f0";
                subGroupItem.style.borderRadius = "6px";
                subGroupItem.style.transition = "background-color 0.3s ease";
                subGroupItem.onmouseover = () => subGroupItem.style.backgroundColor = "#c3d4eb";
                subGroupItem.onmouseout = () => subGroupItem.style.backgroundColor = "#d6e0f0";
                subGroupItem.addEventListener("click", function (event) {
                    event.stopPropagation();
                    toggleTable(subGroupItem, data.instances);
                });

                subGroupList.appendChild(subGroupItem);
            });

            groupItem.appendChild(subGroupList);
        }
    }
};
