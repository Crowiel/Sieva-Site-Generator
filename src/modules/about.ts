import { renderLayout, LayoutOptions } from "./layout.ts";

export function renderAbout(projectCount = 0, blogCount = 0): string {
  const content = `
    <div class="about-page">
      <div class="container">
        <section class="about-hero">
          <div class="about-intro">
            <h1>About Me</h1>
            <div class="about-content">
            <div class="about-text">
              <p>I'm an automation engineer with a passion for embedded systems, combining both programming expertise and electronics design to create innovative solutions.</p>
              
              <h2>Experience & Skills</h2>
              <div class="skills-grid">
                <div class="skill-category">
                  <h3>Programming</h3>
                  <ul>
                    <li>C++ (Advanced)</li>
                    <li>Embedded C</li>
                    <li>TypeScript/JavaScript</li>
                    <li>Python</li>
                    <li>Assembly</li>
                  </ul>
                </div>
                
                <div class="skill-category">
                  <h3>Embedded Systems</h3>
                  <ul>
                    <li>Microcontrollers (AVR, ARM, PIC)</li>
                    <li>Real-time systems (RTOS)</li>
                    <li>IoT development</li>
                    <li>Hardware debugging</li>
                    <li>Protocol implementation</li>
                  </ul>
                </div>
                
                <div class="skill-category">
                  <h3>Electronics Design</h3>
                  <ul>
                    <li>PCB Design (Altium, KiCad)</li>
                    <li>Analog circuit design</li>
                    <li>Digital signal processing</li>
                    <li>Power electronics</li>
                    <li>EMC/EMI considerations</li>
                  </ul>
                </div>
                
                <div class="skill-category">
                  <h3>Automation</h3>
                  <ul>
                    <li>Industrial control systems</li>
                    <li>PLC programming</li>
                    <li>SCADA systems</li>
                    <li>Process automation</li>
                    <li>System integration</li>
                  </ul>
                </div>
              </div>

              <h2>Interests & Hobbies</h2>
              <p>When I'm not working on automation systems, I enjoy exploring:</p>
              <ul class="interests">
                <li>Open-source hardware projects</li>
                <li>Robotics and mechatronics</li>
                <li>IoT and smart home automation</li>
                <li>Electronics prototyping</li>
                <li>Contributing to embedded systems communities</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section class="contact-section">
        <h2>Get In Touch</h2>
        <p>Interested in collaboration or have questions about my projects? Feel free to reach out!</p>
        <div class="contact-links">
          <a href="mailto:your.email@example.com" class="btn-primary">Email Me</a>
          <a href="https://github.com/yourusername" class="btn-secondary" target="_blank">GitHub</a>
          <a href="https://linkedin.com/in/yourusername" class="btn-secondary" target="_blank">LinkedIn</a>
        </div>
      </section>
      </div>
    </div>
  `;

  const layoutOptions = {
    showProjects: projectCount > 0,
    showBlog: blogCount > 0,
  };

  return renderLayout("About", content, "", layoutOptions);
}