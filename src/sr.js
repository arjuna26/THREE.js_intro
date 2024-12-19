var sr = ScrollReveal({
    distance: '40px',
    duration: 2500,
})

var sr2 = ScrollReveal({
    distance: '40px',
    duration: 2500,
})

sr.reveal('.main-header', {origin: 'left', delay: 1500})
sr.reveal('.right', {origin: 'right', delay: 2000})
// sr.reveal('canvas', {origin: 'back', delay: 600})
sr.reveal('.left', {origin: 'left', delay: 200})
sr2.reveal('.social-links', { origin: 'left', delay: 100, interval: 1000 });

