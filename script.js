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
                        backgroundColor: 'rgba(54, 162, 235, 0.7)',
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
        groupListDiv.innerHTML = `<h2 style="color: #333;">Publications for ${year}:</h2>`;

        const list = document.createElement('ul');
        list.style.listStyleType = "none";
        list.style.padding = "0";

        Object.entries(groupData).forEach(([group, data]) => {
            const groupItem = document.createElement('li');
            groupItem.innerHTML = `<strong style="color: #222; font-size: 16px;">${group}</strong> (${data.count})`;
            groupItem.style.cursor = "pointer";
            groupItem.style.padding = "8px";
            groupItem.style.margin = "5px 0";
            groupItem.style.backgroundColor = "#f7f7f7";
            groupItem.style.borderRadius = "5px";
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
            subGroupList.style.marginLeft = "10px";
            subGroupList.style.padding = "5px";
            subGroupList.style.listStyleType = "none";

            Object.entries(subGroups).forEach(([subGroup, data]) => {
                const subGroupItem = document.createElement('li');
                subGroupItem.innerHTML = `<strong>${subGroup}</strong> (${data.count})`;
                subGroupItem.style.cursor = "pointer";
                subGroupItem.style.padding = "6px";
                subGroupItem.style.margin = "3px 0";
                subGroupItem.style.backgroundColor = "#e9ecef";
                subGroupItem.style.borderRadius = "5px";
                subGroupItem.addEventListener("click", function (event) {
                    event.stopPropagation();
                    toggleTable(subGroupItem, data.instances);
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
            table.style.marginTop = "10px";
            table.style.borderCollapse = "collapse";
            table.style.width = "95%";
            table.style.backgroundColor = "#ffffff";
            table.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
            table.style.borderRadius = "5px";
            table.border = "1";

            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            ['Title', 'Authors', 'URL'].forEach(text => {
                const th = document.createElement('th');
                th.textContent = text;
                th.style.border = "1px solid #ddd";
                th.style.padding = "8px";
                th.style.backgroundColor = "#007bff";
                th.style.color = "white";
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            instances.forEach(instance => {
                const row = document.createElement('tr');
                row.style.backgroundColor = "#f9f9f9";
                row.innerHTML = `
                    <td style="border: 1px solid #ddd; padding: 8px; max-width: 200px; word-wrap: break-word;">${instance.title}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${instance.authors}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">
                        <a href="${instance.url}" target="_blank" style="color: #007bff; text-decoration: none;">[Link]</a>
                    </td>
                `;
                tbody.appendChild(row);
            });
            table.appendChild(tbody);

            subGroupItem.appendChild(table);
        }
    }
};
