window.onload = function () {
    Papa.parse("merged_results.csv", {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: function (results) {
            processData(results.data, "year"); // Default group by "year"
        },
        error: function (error) {
            console.error("Error parsing CSV:", error);
        }
    });

    // Add event listener for dropdown change
    document.getElementById('group-by-dropdown').addEventListener('change', function () {
        const selectedGroup = this.value;
        Papa.parse("merged_results.csv", {
            download: true,
            header: true,
            dynamicTyping: true,
            complete: function (results) {
                processData(results.data, selectedGroup);
            },
            error: function (error) {
                console.error("Error parsing CSV:", error);
            }
        });
    });

    function processData(data, groupBy) {
        const groupData = groupBy === "year" ? groupByYear(data) : groupByCategory(data);

        if (groupData.length > 0) {
            const ctx = document.getElementById('chart').getContext('2d');
            const chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: groupData.map(item => item.label),
                    datasets: [{
                        label: groupBy === "year" ? 'Publications by Year' : 'Publications by Category',
                        data: groupData.map(item => item.count),
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
                            const clickedLabel = groupData[activePoints[0].index].label;
                            const clickedData = groupData[activePoints[0].index].data;
                            displayGroupList(clickedData, clickedLabel, groupBy);
                        }
                    }
                }
            });
        } else {
            console.error("No valid data available for plotting.");
        }
    }

    function groupByYear(data) {
        const years = data.map(item => item.year).filter(year => year && !isNaN(year)).map(Number);
        const uniqueYears = [...new Set(years)].sort((a, b) => a - b);

        return uniqueYears.map(year => {
            const yearData = data.filter(item => item.year === year);
            return {
                label: year,
                count: yearData.length,
                data: getGroupData(yearData, year)
            };
        });
    }

    function groupByCategory(data) {
        const categories = [...new Set(data.map(item => item.category).filter(c => c))];
        return categories.map(category => {
            const categoryData = data.filter(item => item.category === category);
            return {
                label: category,
                count: categoryData.length,
                data: getGroupData(categoryData, category)
            };
        });
    }

    function getGroupData(data, groupValue) {
        const groupData = {};
        data.forEach(item => {
            const groupKey = groupValue === "year" ? item.category : item.subcategory;
            if (!groupData[groupKey]) {
                groupData[groupKey] = { count: 0, sub_groups: {} };
            }
            groupData[groupKey].count += 1;

            const subGroupKey = item.subcategory;
            if (!groupData[groupKey].sub_groups[subGroupKey]) {
                groupData[groupKey].sub_groups[subGroupKey] = { count: 0, instances: [] };
            }
            groupData[groupKey].sub_groups[subGroupKey].count += 1;
            groupData[groupKey].sub_groups[subGroupKey].instances.push({
                title: item.title || "No Title",
                authors: item.authors || "Unknown Authors",
                url: item.url || "#"
            });
        });
        return groupData;
    }

    function displayGroupList(groupData, label, groupBy) {
        const groupListDiv = document.getElementById('group-list');
        groupListDiv.innerHTML = `<h3>Publications for ${label}:</h3>`;

        const list = document.createElement('ul');
        list.style.listStyleType = "none";
        
        Object.entries(groupData).forEach(([category, data]) => {
            const groupItem = document.createElement('li');
            groupItem.innerHTML = `<strong>${category}</strong> (${data.count})`;
            groupItem.style.cursor = "pointer";
            groupItem.addEventListener("click", function () {
                toggleSubGroups(groupItem, data.sub_groups, groupBy);
            });
            list.appendChild(groupItem);
        });

        groupListDiv.appendChild(list);
    }

    function toggleSubGroups(groupItem, subGroups, groupBy) {
        let existingList = groupItem.querySelector("ul");
        if (existingList) {
            existingList.remove();
        } else {
            const subGroupList = document.createElement('ul');
            
            Object.entries(subGroups).forEach(([subcategory, data]) => {
                const subGroupItem = document.createElement('li');
                subGroupItem.innerHTML = `<strong>${subcategory}</strong> (${data.count})`;
                subGroupItem.style.cursor = "pointer";
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
            table.style.borderCollapse = "collapse";
            table.style.width = "80%";

            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            ['Title', 'Authors', 'URL'].forEach(text => {
                const th = document.createElement('th');
                th.textContent = text;
                th.style.border = "1px solid #ddd";
                th.style.padding = "8px";
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            instances.forEach(instance => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td style="border: 1px solid #ddd; padding: 8px;">${instance.title}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${instance.authors}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">
                        <a href="${instance.url}" target="_blank">[Link]</a>
                    </td>
                `;
                tbody.appendChild(row);
            });
            table.appendChild(tbody);

            subGroupItem.appendChild(table);
        }
    }
};
