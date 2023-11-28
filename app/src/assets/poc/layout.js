customElements.define("ce-layout", class extends HTMLElement {
    #menu;

    connectedCallback() {
      this.attachShadow({mode: "open"});

      fetch('/assets/menu.json').then(r => r.json()).then(menu => {
        this.#menu = menu;
        this.render()
      })
    }

    render() {
      this.shadowRoot.innerHTML = `
        <link rel="stylesheet" href="assets/poc/mta.css">

        <div class="App container-component-wrapper">
          <div class="page-wrapper">
            <nav class="navbar-toggleable-xl navbar navbar-light">
              <div class="navbar-header">
                <button aria-label="Ava/sulge menüü" aria-controls="global-menu" aria-expanded="false" type="button" class="navbar-toggler">
                  <span></span><span></span><span></span></button>
                <div class="navbar-header-home"><a class="sidebar-header" href="/">ANDMEKIRJELDUSKESKKOND</a></div>
              </div>

              <ul class="navbar-nav"></ul>

              <ul class="navbar-right navbar-nav">
                <li class="nav-logout nav-item"><span>Login sisse</span></li>
              </ul>
            </nav>
            <div class=""></div>

            <div class="content-wrapper">
              <ul class="global-menu" id="global-menu">
                <li><a id="xsdNav" class="global-menu-registries" title="XSD" href="/"><span class="global-menu-item-overflow">TermX</span></a></li>
              </ul>
              <div class="sidebar collapse" id="sidebar-collapse" aria-expanded="false">
                <div class="sidebar-container">
                  <div class="sidebar-section">
                    ${this.#menu.map(mi => `
                      <a id="ANDMEKONTROLLIMOODUL" class="sidebar-header sidebar-section-toggle">${mi.label.en}</a>
                      <ul>
                        ${mi.items.map(l => `<li><a id="sectionKomplektid" href="/${l.link}">${l.label.en}</a></li>`).join('')}
                      </ul>
                    `).join('')}
                  </div>
                </div>
              </div>

              <div class="workarea container-fluid">
                <slot name="ce-content"></slot>
              </div>
            </div>
          </div>

          <footer>
            <div class="footer-top">
              <div class="footer-logo"><img alt="TEHIK-u logo" src="/assets/poc/tehik_logo.2326e4c4de7041746e47.png"></div>
              <div class="footer-quick-links"><h2>Kiirelt kätte</h2>
                <ul class="list-with-arrows">
                  <table>
                    <tbody>
                    <tr>
                      <td>
                        <li><a class="link-gray" href="https://pub.e-tervis.ee/" target="_blank" rel="noopener noreferrer">Publitseerimiskeskus</a></li>
                      </td>
                      <td>&nbsp;&nbsp;&nbsp;</td>
                      <td>
                        <li><a class="link-gray" href="https://www.tehik.ee" target="_blank" rel="noopener noreferrer">TEHIKu koduleht</a></li>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <li><a class="link-gray" href="https://www.hl7.org/index.cfm" target="_blank" rel="noopener noreferrer">HL7 International</a></li>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <li><a class="link-gray" href="http://www.snomed.org/" target="_blank" rel="noopener noreferrer">SNOMED International</a></li>
                      </td>
                      <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                      <td>
                        <li><a class="link-gray" href="https://browser.ihtsdotools.org/" target="_blank" rel="noopener noreferrer">SNOMED CT sisulehitseja</a></li>
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </ul>
              </div>
              <div>
                <div class="footer-contact">
                  <div>
                    <table>
                      <thead>
                      <tr>
                        <td class="footer-contact-icon"><i class="icon-phone"></i></td>
                        <th><a class="link-phone" href="tel:+372-7943 943">7943 943</a>&nbsp;&nbsp;&nbsp;TEHIK kasutajatugi</th>
                      </tr>
                      <tr>
                        <td>&nbsp;</td>
                      </tr>
                      <tr>
                        <td class="footer-contact-icon"><i class="icon-mail"></i></td>
                        <td>
                          <table>
                            <tbody>
                            <tr>
                              <td><a class="link-mail" href="mailto:abi@tehik.ee">abi@tehik.ee</a>&nbsp;&nbsp;&nbsp;TEHIK kasutajatugi</td>
                            </tr>
                            <tr>
                              <td><a class="link-mail" href="mailto:andmekorraldus@tehik.ee">andmekorraldus@tehik.ee</a>&nbsp;&nbsp;&nbsp;Andmekorraldustalitus</td>
                            </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      </thead>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <ul class="footer-social">
              <li></li>
              <li class="footer-social-placeholder"></li>
              <li></li>
              <li></li>
            </ul>
          </footer>
        </div>
      `
    }
  }
)
