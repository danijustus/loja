/* Loja Dani Justus: carrinho, menu e finalização */
(function () {
  var CATALOGO = {
    amor:     { nome: 'Morri de Amor',          serie: 'Cartas ao Mar · acrílico amarelo',  valor: 590,  pecas: 1, img: '/pages/cartasaomar-amor.jpg',  link: 'https://mpago.li/1ePY7sH' },
    saudade:  { nome: 'Morri de Saudade',       serie: 'Cartas ao Mar · acrílico violeta',  valor: 590,  pecas: 1, img: '/pages/cartasaomar-saudade.jpg', link: 'https://mpago.li/2yBR3yn' },
    vontade:  { nome: 'Não Morri de Vontade',   serie: 'Cartas ao Mar · acrílico vermelho', valor: 590,  pecas: 1, img: '/pages/cartasaomar-vontade.jpg', link: 'https://mpago.li/149D7LP' },
    triptico: { nome: 'Tríptico Cartas ao Mar', serie: 'As três obras, cada uma na sua caixa', valor: 1490, pecas: 3, img: '/pages/cartasaomar-trio-sala.jpg', link: 'https://mpago.li/1TTqeTE' }
  };
  var JANELA = { serie: 'Janelas para o Rio · 18 × 18 cm', valor: 900, pecas: 1, link: 'https://mpago.li/2ra7G6K' };
  var CHAVE = 'dj_carrinho';
  var WHATS = '5521998733496';

  function ler() { try { return JSON.parse(localStorage.getItem(CHAVE)) || []; } catch (e) { return memoria; } }
  var memoria = [];
  function gravar(c) { memoria = c; try { localStorage.setItem(CHAVE, JSON.stringify(c)); } catch (e) {} atualizarContador(); }

  function brl(n) { return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function freteDe(pecas) { if (pecas <= 0) return 0; if (pecas === 1) return 50; if (pecas === 2) return 75; return 120 + 25 * (pecas - 3); }
  function totais(c) {
    var sub = 0, pecas = 0, itens = 0;
    c.forEach(function (i) { sub += i.valor * i.qtd; pecas += i.pecas * i.qtd; itens += i.qtd; });
    var frete = freteDe(pecas);
    return { sub: sub, pecas: pecas, itens: itens, frete: frete, total: sub + frete };
  }
  function abs(src) { var a = document.createElement('a'); a.href = src; return a.pathname; }

  function adicionar(item) {
    var c = ler();
    var achado = c.filter(function (i) { return i.id === item.id; })[0];
    if (achado) achado.qtd += 1; else { item.qtd = 1; c.push(item); }
    gravar(c);
    if (window.fbq) fbq('track', 'AddToCart', { content_name: item.nome, content_category: 'Fine Art', currency: 'BRL', value: item.valor });
    abrirGaveta();
  }
  function mudar(id, delta) {
    var c = ler();
    c.forEach(function (i) { if (i.id === id) i.qtd += delta; });
    c = c.filter(function (i) { return i.qtd > 0; });
    gravar(c);
    desenharGaveta();
    if (window.desenharResumo) window.desenharResumo();
  }

  /* contador no menu */
  function atualizarContador() {
    var t = totais(ler());
    document.querySelectorAll('[data-qtd]').forEach(function (el) {
      el.textContent = t.itens; el.style.display = t.itens ? '' : 'none';
    });
  }

  /* gaveta do carrinho */
  var gaveta;
  function criarGaveta() {
    gaveta = document.createElement('div');
    gaveta.className = 'gaveta';
    gaveta.innerHTML = '<div class="gaveta-fundo" data-fechar></div><aside class="gaveta-painel" role="dialog" aria-label="Meu carrinho">' +
      '<div class="gaveta-topo"><h2>Meu carrinho</h2><button type="button" class="gaveta-x" data-fechar aria-label="Fechar">&times;</button></div>' +
      '<div class="gaveta-itens"></div><div class="gaveta-rodape"></div></aside>';
    document.body.appendChild(gaveta);
    gaveta.addEventListener('click', function (e) {
      if (e.target.closest('[data-fechar]')) { fecharGaveta(); return; }
      var m = e.target.closest('[data-mudar]');
      if (m) mudar(m.getAttribute('data-id'), +m.getAttribute('data-mudar'));
    });
  }
  function linhaItem(i, controles) {
    return '<div class="item"><img src="' + i.img + '" alt=""><div class="item-info"><p class="item-nome">' + i.nome + '</p><p class="item-serie">' + i.serie + '</p>' +
      (controles ? '<div class="qtd"><button type="button" data-mudar="-1" data-id="' + i.id + '" aria-label="Diminuir">−</button><span>' + i.qtd + '</span><button type="button" data-mudar="1" data-id="' + i.id + '" aria-label="Aumentar">+</button></div>' : '<p class="item-serie">Quantidade: ' + i.qtd + '</p>') +
      '</div><p class="item-preco">' + brl(i.valor * i.qtd) + '</p></div>';
  }
  function desenharGaveta() {
    if (!gaveta) return;
    var c = ler(), t = totais(c);
    gaveta.querySelector('.gaveta-itens').innerHTML = c.length ? c.map(function (i) { return linhaItem(i, true); }).join('') :
      '<p class="vazio">Seu carrinho está vazio.</p>';
    gaveta.querySelector('.gaveta-rodape').innerHTML = c.length ?
      '<div class="conta"><span>Subtotal</span><span>' + brl(t.sub) + '</span></div><div class="conta"><span>Frete fixo para todo o Brasil</span><span>' + brl(t.frete) + '</span></div>' +
      '<div class="conta total"><span>Total</span><span>' + brl(t.total) + '</span></div>' +
      '<a class="botao-loja" href="/finalizar">Finalizar compra</a><button type="button" class="botao-loja claro" data-fechar>Continuar comprando</button>' :
      '<button type="button" class="botao-loja" data-fechar>Continuar comprando</button>';
  }
  function abrirGaveta() { if (!gaveta) criarGaveta(); desenharGaveta(); gaveta.classList.add('aberta'); document.body.style.overflow = 'hidden'; }
  function fecharGaveta() { if (gaveta) gaveta.classList.remove('aberta'); document.body.style.overflow = ''; }

  /* cliques nas páginas */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-comprar]');
    if (b) {
      e.preventDefault();
      var k = b.getAttribute('data-comprar');
      if (CATALOGO[k]) {
        var o = CATALOGO[k];
        adicionar({ id: k, nome: o.nome, serie: o.serie, valor: o.valor, pecas: o.pecas, img: o.img, link: o.link });
      } else {
        var obra = b.closest('.obra'), im = obra && obra.querySelector('img');
        var src = im ? abs(im.getAttribute('data-frente') || im.getAttribute('src')) : '/pages/janelas-dupla-mesa.jpg';
        adicionar({ id: 'janela:' + k, nome: k, serie: JANELA.serie, valor: JANELA.valor, pecas: 1, img: src, link: JANELA.link });
      }
      return;
    }
    if (e.target.closest('[data-abrir-carrinho]')) { e.preventDefault(); abrirGaveta(); return; }
    var t = e.target.closest('.troca');
    if (t) {
      var i = t.querySelector('img'), lado = i.getAttribute('src') === i.getAttribute('data-frente');
      i.setAttribute('src', i.getAttribute(lado ? 'data-lado' : 'data-frente'));
      return;
    }
    if (!window.fbq) return;
    if (e.target.closest('[data-contato]')) fbq('track', 'Contact', { content_name: 'WhatsApp' });
    if (e.target.closest('[data-visita]')) fbq('track', 'Schedule', { content_name: 'Visita ao estúdio' });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fecharGaveta(); });

  window.Loja = { ler: ler, gravar: gravar, totais: totais, brl: brl, linhaItem: linhaItem, mudar: mudar, WHATS: WHATS };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', atualizarContador); else atualizarContador();
})();
