const cards = document.querySelector('.cards')
const search = document.querySelector('.search')

// styling options for the dates on the chart
const options = {
    month: "short",
    day: "2-digit"
}

// .then(() => {
//     const cardTextList = Array.from(cards.children).map(elem => elem.outerHTML.slice(5,-6))
//     search.addEventListener('input', e => {
//         inp = e.target.value
//         let cutList = cardTextList.filter((node) => {
//             return node.toLowerCase().includes(inp.toLowerCase())
//         })
//         console.log(cutList)
//     })
// })

async function createCards() {
    try {
        const res = await fetch('https://api.coingecko.com/api/v3/coins/list')
        const data = await res.json()

        for (let i = 0; i < 200; i++) {
            if (/\half|hedge|bear|bull/.test(data[i]['symbol'])) {
                    continue
            }

            const secondRes = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${data[i]['id']}&order=market_cap_desc&per_page=100&page=1&sparkline=false`)
            const secondData = await secondRes.json()

            let newDiv = document.createElement('div')
            // newDiv.setAttribute('class','m-3')
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
}

createCards()