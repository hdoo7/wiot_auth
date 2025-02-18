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
                        label: 'Publications by Year',
                        data: yearCount.map(item => item.count),
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
            if (!groupData[item.category]) {
                groupData[item.category] = { count: 0, sub_groups: {} };
            }
            groupData[item.category].count += 1;

            if (!groupData[item.category].sub_groups[item.subcategory]) {
                groupData[item.category].sub_groups[item.subcategory] = { count: 0, instances: [] };
            }
            groupData[item.category].sub_groups[item.subcategory].count += 1;
            groupData[item.category].sub_groups[item.subcategory].instances.push({
                title: item.title || "No Title",
                authors: item.authors || "Unknown Authors",
                url: item.url || "#"
            });
        });
        return groupData;
    }

    function displayGroupList(groupData, year) {
        const groupListDiv = document.getElementById('group-list');
        groupListDiv.innerHTML = `<h3>Publications for ${year}:</h3>`;

        const list = document.createElement('ul');
        list.style.listStyleType = "none";
        
        Object.entries(groupData).forEach(([category, data]) => {
            const groupItem = document.createElement('li');
            groupItem.innerHTML = `<strong>${category}</strong> (${data.count})`;
            groupItem.style.cursor = "pointer";
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
            table.style.width = "100%";

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
