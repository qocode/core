import jsdom from 'jsdom'

const { JSDOM } = jsdom
const { window } = new JSDOM('', { url: 'https://qcos.ru/' })


global.window = window
