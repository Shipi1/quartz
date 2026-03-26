import { formatDate } from "./Date"
import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import readingTime from "reading-time"
import { classNames } from "../util/lang"
import { i18n } from "../i18n"
import { JSX } from "preact"
import style from "./styles/contentMeta.scss"

interface ContentMetaOptions {
  /**
   * Whether to display reading time
   */
  showReadingTime: boolean
  showComma: boolean
}

const defaultOptions: ContentMetaOptions = {
  showReadingTime: true,
  showComma: true,
}

export default ((opts?: Partial<ContentMetaOptions>) => {
  // Merge options with defaults
  const options: ContentMetaOptions = { ...defaultOptions, ...opts }

  function ContentMetadata({ cfg, fileData, displayClass }: QuartzComponentProps) {
    const text = fileData.text

    if (text) {
      const segments: (string | JSX.Element)[] = []

      if (fileData.dates) {
        const created = fileData.dates.created
        const modified = fileData.dates.modified

        if (created) {
          const createdStr = formatDate(created, cfg.locale)
          if (modified && modified.getTime() !== created.getTime()) {
            segments.push(
              <span>
                {createdStr}. Modified:{" "}
                <time class="content-meta-modified" datetime={modified.toISOString()}>
                  {formatDate(modified, cfg.locale)}
                </time>
              </span>,
            )
          } else {
            segments.push(<span>{createdStr}</span>)
          }
        }
      }

      // Display reading time if enabled
      if (options.showReadingTime) {
        const { minutes, words: _words } = readingTime(text)
        const displayedTime = i18n(cfg.locale).components.contentMeta.readingTime({
          minutes: Math.ceil(minutes),
        })
        segments.push(<span>{displayedTime}</span>)
      }

      return (
        <p show-comma={options.showComma} class={classNames(displayClass, "content-meta")}>
          {segments}
        </p>
      )
    } else {
      return null
    }
  }

  ContentMetadata.css = style

  ContentMetadata.afterDOMLoaded = `
    document.addEventListener("nav", () => {
      const el = document.querySelector(".content-meta-modified")
      if (el) {
        const iso = el.getAttribute("datetime")
        if (iso) {
          const d = new Date(iso)
          const formatted = d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }) + " " + d.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
          el.textContent = formatted
        }
      }
    })
  `

  return ContentMetadata
}) satisfies QuartzComponentConstructor
