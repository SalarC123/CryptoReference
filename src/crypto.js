const cards = document.querySelector('.cards')
const search = document.querySelector('.search')

// SEARCH FUNCTION
// MAKE MULTIPLE ASYNC FUNCS

// styling options for the dates on the chart
const options = {
    month: "short",
    day: "2-digit"
}

async function createCards() {
    try {
        const res = await fetch('https://api.coingecko.com/api/v3/coins/list')
        const data = await res.json()

        for (let i = 0; i < 100; i++) {
            // Filters out coins with minimal data
            if (/\half|hedge|bear|bull/.test(data[i]['symbol'].toLowerCase())) {
                    continue
            }

            const secondRes = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${data[i]['id']}&order=market_cap_desc&per_page=100&page=1&sparkline=false`)
            const secondData = await secondRes.json()

            let newDiv = document.createElement('div')
            cards.appendChild(newDiv)
            newDiv.innerText = data[i]["symbol"]
            newDiv.classList.add('coin-name')

            const coinImg = document.createElement('img')
            coinImg.src = secondData[0].image
            newDiv.appendChild(coinImg)

            const chart = document.createElement('canvas')
            chart.style.width = '400px'
            chart.style.height = '400px'
            newDiv.appendChild(chart)

            const keyInfo = document.createElement('div')
            keyInfo.classList.add('key-info')
            keyInfo.innerText = `Current Price: $${secondData[0].current_price}\n
                                 Market Cap: ${secondData[0].market_cap}\n
                                 Total Volume: ${secondData[0].total_volume}\n
                                 24-hour High: $${secondData[0].high_24h}`

            newDiv.appendChild(keyInfo)



            const thirdRes = await fetch(`https://api.coingecko.com/api/v3/coins/${data[i]['id']}/market_chart?vs_currency=usd&days=10&interval=daily`)
            const thirdData = await thirdRes.json()

            const coinPrices = []
            const priceDates = []

            for (const pair of thirdData.prices) {
                const [unixDate, price] = pair
                coinPrices.push(price)
                priceDates.push(new Date(unixDate).toLocaleDateString('en-us', options))
            }

            // Sets chart colors to white
            Chart.defaults.global.defaultFontColor = 'white'

            var lineChart = new Chart(chart, {
                type: 'line',
                data: {
                    labels: priceDates,
                    datasets: [
                        {
                            label:data[i]['symbol'],
                            data: coinPrices,
                            borderColor: 'white',
                            fill:false,
                            pointBackgroundColor: 'white',
                            lineTension: 0,
                        }
                    ]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                // Include a dollar sign in the ticks
                                callback: function(value, index, values) {
                                    return '$' + value;
                                }
                            }
                        }]
                    }
                }
            })
        }
    } catch (error) {
        console.log(error)
    }
    // Changes placeholder once all cards have loaded in
    search.placeholder = 'Search Cryptocurrencies'
}


createCards()


// Search functionality
document.querySelector('.search-img').addEventListener('click', () => {

    const cardArray = Array.from(cards.children)

    let inp = search.value
    
    // Finds the name of the coin and checks if that name includes the text in the input
    for (element of cardArray) {
        if (element.innerText.split('\n')[0].toLowerCase().includes(inp.toLowerCase())) {
            element.style.display = 'block'
        } else {
            element.style.display = 'none'
        }
    }
})