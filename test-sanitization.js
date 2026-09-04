import sanitizeHtml from 'sanitize-html'

// Sanitize HTML with sanitize-html (same configuration as production)
function sanitizeHTML(html) {
  return sanitizeHtml(html, {
    allowedTags: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre', 'span', 'div'],
    allowedAttributes: {
      'a': ['href', 'title', 'target'],
      '*': ['class', 'id']
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: {
      'a': ['http', 'https', 'mailto']
    },
    disallowedTags: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'svg', 'math'],
    disallowedAttributes: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit', 'ondblclick', 'onmousedown', 'onmouseup', 'onmousemove', 'onmouseout', 'onkeypress', 'onkeydown', 'onkeyup'],
    enforceHtmlBoundary: true
  })
}

// Test cases
const tests = [
  {
    name: 'Test 1: Script tag',
    input: '<script>alert(1)</script>',
    expected: 'script removido',
    shouldNotContain: ['<script', 'alert(1)']
  },
  {
    name: 'Test 2: Image with onerror',
    input: '<img src=x onerror="alert(1)">',
    expected: 'onerror removido ou tag removida',
    shouldNotContain: ['onerror', 'alert(1)']
  },
  {
    name: 'Test 3: JavaScript href',
    input: '<a href="javascript:alert(1)">teste</a>',
    expected: 'javascript: removido/bloqueado',
    shouldNotContain: ['javascript:', 'alert(1)']
  },
  {
    name: 'Test 4: Iframe',
    input: '<iframe src="https://evil.example"></iframe>',
    expected: 'iframe removido',
    shouldNotContain: ['<iframe', 'evil.example']
  },
  {
    name: 'Test 5: onclick on paragraph',
    input: '<p onclick="alert(1)">texto</p>',
    expected: 'onclick removido e texto preservado',
    shouldNotContain: ['onclick', 'alert(1)'],
    shouldContain: ['texto']
  },
  {
    name: 'Test 6: SVG with onload',
    input: '<svg onload="alert(1)"></svg>',
    expected: 'vetor executável removido/bloqueado',
    shouldNotContain: ['<svg', 'onload', 'alert(1)']
  },
  {
    name: 'Test 7: Legitimate HTML',
    input: '<h2>Título</h2><p>Texto <strong>importante</strong>.</p><ul><li>Item</li></ul><a href="https://example.com">Link</a>',
    expected: 'conteúdo legítimo preservado',
    shouldContain: ['<h2>Título</h2>', '<p>Texto <strong>importante</strong>.</p>', '<ul><li>Item</li></ul>', '<a href="https://example.com">Link</a>']
  }
]

// Run tests
console.log('=== SANITIZATION TESTS ===\n')

let passed = 0
let failed = 0

tests.forEach((test, index) => {
  const result = sanitizeHTML(test.input)
  let testPassed = true
  const failures = []

  // Check shouldNotContain
  if (test.shouldNotContain) {
    test.shouldNotContain.forEach(str => {
      if (result.includes(str)) {
        testPassed = false
        failures.push(`Deveria NÃO conter: "${str}"`)
      }
    })
  }

  // Check shouldContain
  if (test.shouldContain) {
    test.shouldContain.forEach(str => {
      if (!result.includes(str)) {
        testPassed = false
        failures.push(`Deveria conter: "${str}"`)
      }
    })
  }

  if (testPassed) {
    passed++
    console.log(`✅ ${test.name}: PASS`)
    console.log(`   ${test.expected}`)
  } else {
    failed++
    console.log(`❌ ${test.name}: FAIL`)
    console.log(`   ${test.expected}`)
    console.log(`   Falhas: ${failures.join(', ')}`)
    console.log(`   Input: ${test.input}`)
    console.log(`   Output: ${result}`)
  }
  console.log()
})

console.log('=== SUMMARY ===')
console.log(`Total: ${tests.length}`)
console.log(`Passed: ${passed}`)
console.log(`Failed: ${failed}`)

if (failed === 0) {
  console.log('\n✅ All tests passed!')
  process.exit(0)
} else {
  console.log('\n❌ Some tests failed!')
  process.exit(1)
}
