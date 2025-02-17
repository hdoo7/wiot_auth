window.onload = function () {

    const dropdown = document.getElementById("groupBy");
    dropdown.addEventListener("change", function () {
        const groupBy = dropdown.value;
        Papa.parse("merged_results.csv", {
            download: true,
            header: true,
            dynamicTyping: true,
            complete: function (results) {
                console.log('Parsed CSV data:', results.data);  // Debugging log to check parsed data
                processData(results.data, groupBy);
            },
            error: function (error) {
                console.error("Error parsing CSV:", error);
            }
        });
    });

    let chart = null;

    function processData(data, groupBy) {
        if (chart) {
            chart.destroy();
        }

        if (groupBy === 'year') {
            const years = data.map(item => item.year).filter(year => year && !isNaN(year)).map(Number);
            const uniqueYears = [...new Set(years)].sort((a, b) => a - b);
            const yearCount = uniqueYears.map(year => ({
                year: year,
                count: years.filter(y => y === year).length
            }));

            if (yearCount.length > 0) {
                createChart(yearCount, 'Year');
            } else {
                console.error("No valid data available for Year grouping.");
            }
        } else if (groupBy === 'category') {
            // Make sure to check for the existence of the 'category' field
            const categories = data.map(item => item.group).filter(category => category).map(String);
            if (categories.length === 0) {
                console.error("No valid 'category' data available.");
                return;
            }

            const uniqueCategories = [...new Set(categories)];
            const categoryCount = uniqueCategories.map(category => ({
                category: category,
                count: categories.filter(c => c === category).length
            }));

            if (categoryCount.length > 0) {
                createChart(categoryCount, 'Category');
            } else {
                console.error("No valid data available for Category grouping.");
            }
        }
    }

    function createChart(countData, groupType) {
        const ctx = document.getElementById('chart').getContext('2d');
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: countData.map(item => item[groupType.toLowerCase()]),
                datasets: [{
                    label: `Count by ${groupType}`,
                    data: countData.map(item => item.count),
                    backgroundColor: 'rgba(54, 162, 235, 0.3)',
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
                        const clickedValue = countData[activePoints[0].index][groupType.toLowerCase()];
                        displayGroupList(getGroupData(data, clickedValue), clickedValue);
                    }
                }
            }
        });
    }

    function getGroupData(data, groupValue) {
        const groupData = {};
        data.filter(item => item.year === groupValue || item.group === groupValue).forEach(item => {
            const group = item.group || 'Unknown Group';
            if (!groupData[group]) {
                groupData[group] = { count: 0, sub_groups: {} };
            }
            groupData[group].count += 1;

            const subGroup = item.sub_group || 'Unknown Sub-group';
            if (!groupData[group].sub_groups[subGroup]) {
                groupData[group].sub_groups[subGroup] = { count: 0, instances: [] };
            }
            groupData[group].sub_groups[subGroup].count += 1;
            groupData[group].sub_groups[subGroup].instances.push({
                title: item.title || "No Title",
                authors: item.authors || "Unknown Authors",
                url: item.url || "#"
            });
        });
        return groupData;
    }

    function displayGroupList(groupData, groupValue) {
        const groupListDiv = document.getElementById('group-list');
        groupListDiv.innerHTML = `<h3>Publications for ${groupValue}:</h3>`;

        const list = document.createElement('ul');
        list.style.listStyleType = "none";
        list.style.padding = "0";
        list.style.margin = "0";

        Object.entries(groupData).forEach(([group, data]) => {
            const groupItem = document.createElement('li');
            groupItem.innerHTML = `<strong>${group}</strong> (${data.count})`;
            groupItem.style.cursor = "pointer";
            groupItem.style.padding = "6px 20px";
            groupItem.style.margin = "8px 0";
            groupItem.style.backgroundColor = "#f7f7f7";
            groupItem.style.borderRadius = "12px";
            groupItem.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.05)";
            groupItem.style.transition = "background-color 0.3s ease";
            groupItem.addEventListener("click", function () {
                toggleSubGroups(groupItem, data.sub_groups);
            });

            groupItem.addEventListener("mouseenter", () => {
                groupItem.style.backgroundColor = "#e1e1e1";
            });
            groupItem.addEventListener("mouseleave", () => {
                groupItem.style.backgroundColor = "#f7f7f7";
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
                subGroupItem.style.padding = "6px 12px";
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
            table.style.width = "80%";
            table.style.backgroundColor = "#ffffff";
            table.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
            table.style.borderRadius = "10px";

            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            ['Title', 'Authors', 'URL'].forEach(text => {
                const th = document.createElement('th');
                th.textContent = text;
                th.style.border = "1px solid #ddd";
                th.style.padding = "8px";
                th.style.backgroundColor = "#ffffff"; 
                th.style.color = "black";
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
                    <td style="border: 1px solid #ddd; padding: 8px; max-width: 250px; word-wrap: break-word;">${instance.title}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;max-width: 100px;">${instance.authors}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">
                        <a href="${instance.url}" target="_blank" style="color: #0071e3; text-decoration: none; font-weight: 500;">[Link]</a>
                    </td>
                `;
                tbody.appendChild(row);
            });
            table.appendChild(tbody);

            subGroupItem.appendChild(table);
        }
    }

};
