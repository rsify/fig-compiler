const babel = require('babel-core')
const pug = require('pug')

module.exports = (input, opts = {}) => {
	const res = {}

	const lines = input.split('\n')

	const tagContent = tag => {
		let index = lines.findIndex(x => x.indexOf(tag) === 0)
		if (index === -1) return ''
		index += 1

		const endIndex = lines.slice(index)
			.findIndex(x => /^\S/.test(x))

		const content = (endIndex !== -1) ?
			lines.slice(index, index + endIndex) :
			lines.slice(index)

		// slice off leading indentation
		const indentIndex = content[0].search(/\S/)
		content.forEach((x, i) => {
			content[i] = x.slice(indentIndex)
		})

		content.unshift(lines[index - 1].slice(tag.length + 1))

		return content.join('\n').trim()
	}

	// template
	const compiled = pug.compileClient(tagContent('template'))

	// wrap string of pug & its runtime into a function
	res.template = Function('locals',
		compiled + '\n' + 'return template(locals);')

	// style
	res.style = tagContent('style').split('\n').join('').split('\t').join('')

	// script
	const scriptContent = tagContent('script')
	const transformed = babel.transform(scriptContent, {
		presets: require('babel-preset-es2015')
	})
	res.script = transformed.code

	// name
	res.name = tagContent('label') || opts.defaultName

	return res
}
