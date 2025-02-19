window.onload = function () {
    let currentGroup = "year";
    let chart = null;

    Papa.parse("merged_results.csv", {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: function (results) {
            window.data = results.data;
            processData(window.data);
        },
        error: function (error) {
            console.error("Error parsing CSV:", error);
        }
    });

    document.getElementById('group-by').addEventListener('change', function (e) {
        currentGroup = e.target.value;
        processData(window.data);
    });

    function processData(data) {
        let groupCount = currentGroup === "year" ? getYearCount(data) : getCategoryCount(data);

        if (chart) {
            chart.destroy();
        }

        const ctx = document.getElementById('chart').getContext('2d');
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: groupCount.map(item => item[currentGroup]),
                datasets: [{
                    label: `Publications by ${capitalize(currentGroup)}`,
                    data: groupCount.map(item => item.count),
                    backgroundColor: 'rgba(54, 162, 235, 0.3)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } },
                onClick: function (e, elements) {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        const clickedItem = groupCount[index];
                        displayGroupList(getGroupData(data, clickedItem), currentGroup);
                    }
                }
            }
        });
    }

    function getYearCount(data) {
        return [...new Set(data.map(item => item.year).filter(year => year))]
            .sort()
            .map(year => ({
                year,
                count: data.filter(item => item.year === year).length
            }));
    }

    function getCategoryCount(data) {
        return [...new Set(data.map(item => item.category).filter(category => category))]
            .sort()
            .map(category => ({
                category,
                count: data.filter(item => item.category === category).length
            }));
    }

    function getGroupData(data, groupItem) {
        const groupData = {};
        if (currentGroup === "year") {
            data.filter(item => item.year === groupItem.year).forEach(item => {
                if (!groupData[item.category]) {
                    groupData[item.category] = { count: 0, subcategories: {} };
                }
                groupData[item.category].count++;
                if (!groupData[item.category].subcategories[item.subcategory]) {
                    groupData[item.category].subcategories[item.subcategory] = { count: 0, instances: [] };
                }
                groupData[item.category].subcategories[item.subcategory].count++;
                groupData[item.category].subcategories[item.subcategory].instances.push({
                    title: item.title || "No Title",
                    authors: item.authors || "Unknown Authors",
                    url: item.url || "#"
                });
            });
        }
        return groupData;
    }

    function displayGroupList(groupData, groupType) {
        const groupListDiv = document.getElementById('group-list');
        groupListDiv.innerHTML = `<h3>Publications by ${capitalize(groupType)}:</h3>`;
        const list = document.createElement('ul');
        list.style.listStyleType = "none";

        Object.entries(groupData).forEach(([category, data]) => {
            const categoryItem = document.createElement('li');
            categoryItem.innerHTML = `<strong>${category}</strong> (${data.count})`;
            categoryItem.style.cursor = "pointer";
            categoryItem.addEventListener("click", function () {
                toggleSubcategoryList(categoryItem, data.subcategories);
            });
            list.appendChild(categoryItem);
        });

        groupListDiv.appendChild(list);
    }

    function toggleSubcategoryList(categoryItem, subcategories) {
        let existingList = categoryItem.querySelector("ul");
        if (existingList) {
            existingList.remove();
        } else {
            const subList = document.createElement('ul');
            Object.entries(subcategories).forEach(([subcategory, data]) => {
                const subcategoryItem = document.createElement('li');
                subcategoryItem.innerHTML = `<strong>${subcategory}</strong> (${data.count})`;
                subcategoryItem.style.cursor = "pointer";
                subcategoryItem.addEventListener("click", function () {
                    toggleTable(subcategoryItem, data.instances);
                });
                subList.appendChild(subcategoryItem);
            });
            categoryItem.appendChild(subList);
        }
    }

    function toggleTable(subcategoryItem, instances) {
        let existingTable = subcategoryItem.querySelector("table");
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
            subcategoryItem.appendChild(table);
        }
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
};
