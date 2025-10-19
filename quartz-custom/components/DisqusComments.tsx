import { QuartzComponentConstructor, QuartzComponentProps } from "../../quartz/components/types"

const DisqusComments: QuartzComponentConstructor = () => {
  const DisqusComments = ({ fileData }: QuartzComponentProps) => {
    // Don't show on index page
    if (fileData.slug === "index") {
      return null
    }

    const disqusShortname = "rakshanshetty"
    const disqusConfig = {
      url: `https://rakshanshetty.in/${fileData.slug}`,
      identifier: fileData.frontmatter?.disqus_id || fileData.slug,
      title: fileData.frontmatter?.title
    }

    return (
      <div className="disqus-section">
        <div id="disqus_thread"></div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              var disqus_config = function () {
                this.page.url = '${disqusConfig.url}';
                this.page.identifier = '${disqusConfig.identifier}';
                this.page.title = '${disqusConfig.title}';
              };
              (function() {
                var d = document, s = d.createElement('script');
                s.src = 'https://${disqusShortname}.disqus.com/embed.js';
                s.setAttribute('data-timestamp', +new Date());
                (d.head || d.body).appendChild(s);
              })();
            `
          }}
        />
        <noscript>
          Please enable JavaScript to view the{" "}
          <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a>
        </noscript>
      </div>
    )
  }

  return DisqusComments
}

export default DisqusComments
