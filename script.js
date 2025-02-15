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
                        backgroundColor: 'rgba(242, 85, 96, 0.7)',  // Soft red with opacity
                        borderColor: 'rgba(242, 85, 96, 1)',  // Red for emphasis
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
        groupListDiv.innerHTML = `<h2 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; color: #333; font-weight: 600;">Publications for ${year}:</h2>`;

        const list = document.createElement('ul');
        list.style.listStyleType = "none";
        list.style.padding = "0";
        list.style.margin = "0";

        Object.entries(groupData).forEach(([group, data]) => {
            const groupItem = document.createElement('li');
            groupItem.innerHTML = `<strong style="color: #333; font-size: 18px; font-weight: 500;">${group}</strong> (${data.count})`;
            groupItem.style.cursor = "pointer";
            groupItem.style.padding = "12px 20px";
            groupItem.style.margin = "8px 0";
            groupItem.style.backgroundColor = "#f2f2f2";
            groupItem.style.borderRadius = "12px";
            groupItem.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
            groupItem.style.transition = "background-color 0.3s ease";
            groupItem.addEventListener("click", function () {
                toggleSubGroups(groupItem, data.sub_groups);
            });

            groupItem.addEventListener("mouseenter", () => {
                groupItem.style.backgroundColor = "#e9e9e9";
            });
            groupItem.addEventListener("mouseleave", () => {
                groupItem.style.backgroundColor = "#f2f2f2";
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
            subGroupList.style.marginLeft = "20px";
            subGroupList.style.padding = "5px";
            subGroupList.style.listStyleType = "none";
            subGroupList.style.transition = "all 0.3s ease";

            Object.entries(subGroups).forEach(([subGroup, data]) => {
                const subGroupItem = document.createElement('li');
                subGroupItem.innerHTML = `<strong>${subGroup}</strong> (${data.count})`;
                subGroupItem.style.cursor = "pointer";
                subGroupItem.style.padding = "10px 15px";
                subGroupItem.style.margin = "5px 0";
                subGroupItem.style.backgroundColor = "#fafafa";
                subGroupItem.style.borderRadius = "10px";
                subGroupItem.style.transition = "background-color 0.3s ease";
                subGroupItem.addEventListener("click", function (event) {
                    event.stopPropagation();
                    toggleTable(subGroupItem, data.instances);
                });

                subGroupItem.addEventListener("mouseenter", () => {
                    subGroupItem.style.backgroundColor = "#e0e0e0";
                });
                subGroupItem.addEventListener("mouseleave", () => {
                    subGroupItem.style.backgroundColor = "#fafafa";
                });

                subGroupList.appendChild(subGroupItem);
            });

            groupItem.appendChild(subGroupList);
        }
    }

    function toggleTable(subGroupItem, instances) {
        let existingTable = subGroupItem.querySelector("table");
        if (existingTable) {
            existingTable.remove();
        } else {
            const table = document.createElement('table');
            table.style.marginTop = "20px";
            table.style.borderCollapse = "collapse";
            table.style.width = "100%";
            table.style.backgroundColor = "#ffffff";
            table.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
            table.style.borderRadius = "10px";

            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            ['Title', 'Authors', 'URL'].forEach(text => {
                const th = document.createElement('th');
                th.textContent = text;
                th.style.border = "1px solid #ddd";
                th.style.padding = "12px";
                th.style.backgroundColor = "#4CAF50";  // Apple-inspired green
                th.style.color = "white";
                th.style.fontWeight = "600";
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            instances.forEach(instance => {
                const row = document.createElement('tr');
                row.style.backgroundColor = "#f9f9f9";
                row.innerHTML = `
                    <td style="border: 1px solid #ddd; padding: 12px; max-width: 250px; word-wrap: break-word;">${instance.title}</td>
                    <td style="border: 1px solid #ddd; padding: 12px;">${instance.authors}</td>
                    <td style="border: 1px solid #ddd; padding: 12px;">
                        <a href="${instance.url}" target="_blank" style="color: #4CAF50; text-decoration: none; font-weight: 500;">[Link]</a>
                    </td>
                `;
                tbody.appendChild(row);
            });
            table.appendChild(tbody);

            subGroupItem.appendChild(table);
        }
    }
};
