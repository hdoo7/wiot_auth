window.onload = function () {
    let currentGroup = "year";
    let chart = null;
    
    Papa.parse("merged_results.csv", {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: results => {
            window.data = results.data;
            processData();
        },
        error: error => console.error("Error parsing CSV:", error)
    });
    
    document.getElementById('group-by').addEventListener('change', e => {
        currentGroup = e.target.value;
        processData();
    });
    
    function processData() {
        if (!window.data) return;
        
        let groupCount = currentGroup === "year" ? getYearCount() : getCategoryCount();
        
        if (chart) chart.destroy();
        
        chart = new Chart(document.getElementById('chart').getContext('2d'), {
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
                onClick: (e) => handleChartClick(e, groupCount)
            }
        });
    }
    
    function handleChartClick(e, groupCount) {
        const activePoints = chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
        if (activePoints.length > 0) {
            const clickedItem = groupCount[activePoints[0].index];
            currentGroup === "year" ?
                displayGroupList(getGroupData(clickedItem.year), `Publications for ${clickedItem.year}`) :
                displayGroupList(getSubcategoriesByCategory(clickedItem.category), `Publications for ${clickedItem.category}`);
        }
    }
    
    function displayGroupList(groupData, title) {
        const groupListDiv = document.getElementById('group-list');
        groupListDiv.innerHTML = `<h3>${title}</h3>`;
        const list = document.createElement('ul');
        list.style.listStyleType = "none";
        
        Object.entries(groupData).forEach(([key, data]) => {
            const groupItem = document.createElement('li');
            groupItem.innerHTML = `<strong>${key}</strong> (${data.count})`;
            groupItem.style.cursor = "pointer";
            groupItem.addEventListener("click", () => toggleTable(groupItem, data.instances || getInstancesBySubcategory(key)));
            list.appendChild(groupItem);
        });
        
        groupListDiv.appendChild(list);
    }
    
    function toggleTable(groupItem, instances) {
        let existingTable = groupItem.querySelector("table");
        if (existingTable) {
            existingTable.remove();
        } else {
            groupItem.appendChild(generateTable(instances));
        }
    }
    
    function generateTable(instances) {
        const table = document.createElement('table');
        table.style.borderCollapse = "collapse";
        table.style.width = "80%";
        
        const columns = ['Title', 'Authors', 'URL', ...getExtraColumns(instances)];
        
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        columns.forEach(text => headerRow.appendChild(createTableCell(text, true)));
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        const tbody = document.createElement('tbody');
        instances.forEach(instance => {
            const row = document.createElement('tr');
            columns.forEach(col => row.appendChild(createTableCell(instance[col] || '', false, col === 'URL')));
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        return table;
    }
    
    function createTableCell(content, isHeader = false, isLink = false) {
        const cell = document.createElement(isHeader ? 'th' : 'td');
        cell.style.border = "1px solid #ddd";
        cell.style.padding = "8px";
        if (isLink) {
            const link = document.createElement('a');
            link.href = content;
            link.target = "_blank";
            link.innerText = "[Link]";
            cell.appendChild(link);
        } else {
            cell.textContent = content;
        }
        return cell;
    }
    
    function getExtraColumns(instances) {
        const extraColumns = ['Accuracy', 'BER', 'EER', 'F1', 'FAR', 'FPR', 'FNR', 'FRR', 'Precision', 'Recall', 'TPR', 'Device', 'Proposed Scheme', 'Target Goal'];
        return extraColumns.filter(col => instances.some(instance => instance[col] !== undefined && instance[col] !== ""));
    }
    
    function getYearCount() {
        return aggregateCount('year');
    }
    
    function getCategoryCount() {
        return aggregateCount('category');
    }
    
    function aggregateCount(key) {
        return [...new Set(window.data.map(item => item[key]).filter(Boolean))].sort()
            .map(value => ({ [key]: value, count: window.data.filter(item => item[key] === value).length }));
    }
    
    function getGroupData(year) {
        return window.data.filter(item => item.year === year).reduce((acc, item) => {
            acc[item.category] = acc[item.category] || { count: 0, instances: [] };
            acc[item.category].count++;
            acc[item.category].instances.push({
                title: item.title || "No Title",
                authors: item.authors || "Unknown Authors",
                url: item.url || "#"
            });
            return acc;
        }, {});
    }
    
    function getSubcategoriesByCategory(category) {
        return window.data.filter(item => item.category === category).reduce((acc, item) => {
            acc[item.subcategory] = acc[item.subcategory] || { count: 0 };
            acc[item.subcategory].count++;
            return acc;
        }, {});
    }
    
    function getInstancesBySubcategory(subcategory) {
        return window.data.filter(item => item.subcategory === subcategory).map(item => ({
            title: item.title || "No Title",
            authors: item.authors || "Unknown Authors",
            url: item.url || "#"
        }));
    }
    
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
};
