package content

import (
	"fmt"
	"html/template"
	"strings"
	"time"
)

// RenderGanttSVG generates a clean, responsive, pre-rendered SVG Gantt chart at build time
func RenderGanttSVG(tasks []GanttTask) template.HTML {
	if len(tasks) == 0 {
		return ""
	}

	type parsedTask struct {
		name     string
		start    time.Time
		end      time.Time
		progress int
		color    string
	}

	var parsed []parsedTask
	var minDate, maxDate time.Time

	for i, t := range tasks {
		st, err1 := time.Parse("2006-01-02", strings.TrimSpace(t.Start))
		et, err2 := time.Parse("2006-01-02", strings.TrimSpace(t.End))
		if err1 != nil || err2 != nil {
			continue
		}
		if et.Before(st) {
			et = st.AddDate(0, 0, 1)
		}

		if i == 0 || st.Before(minDate) {
			minDate = st
		}
		if i == 0 || et.After(maxDate) {
			maxDate = et
		}

		color := t.Color
		if color == "" {
			color = "#007acc"
		}
		prog := t.Progress
		if prog < 0 {
			prog = 0
		}
		if prog > 100 {
			prog = 100
		}

		parsed = append(parsed, parsedTask{
			name:     t.Name,
			start:    st,
			end:      et,
			progress: prog,
			color:    color,
		})
	}

	if len(parsed) == 0 {
		return ""
	}

	// Pad time range slightly
	minDate = minDate.AddDate(0, 0, -2)
	maxDate = maxDate.AddDate(0, 0, 5)
	totalDuration := maxDate.Sub(minDate).Hours()
	if totalDuration <= 0 {
		totalDuration = 24
	}

	const (
		totalWidth = 1040
		labelWidth = 270
		chartWidth = totalWidth - labelWidth - 40
		rowHeight  = 54
		topMargin  = 62
		barHeight  = 28
	)

	chartHeight := topMargin + len(parsed)*rowHeight + 24

	var sb strings.Builder
	sb.WriteString(fmt.Sprintf(`<svg class="gantt-chart-svg" viewBox="0 0 %d %d" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Project Timeline Gantt Chart">`, totalWidth, chartHeight))
	sb.WriteString(`<title>Project Timeline Gantt Chart</title>`)
	sb.WriteString(`<desc>Engineering schedule showing milestone scheduling and completion percentages.</desc>`)

	// Subtle background
	sb.WriteString(fmt.Sprintf(`<rect width="%d" height="%d" fill="var(--color-bg-alt, #161b22)" rx="8" />`, totalWidth, chartHeight))

	// Month / Milestone header ticks
	currMonth := time.Date(minDate.Year(), minDate.Month(), 1, 0, 0, 0, 0, minDate.Location())
	for !currMonth.After(maxDate) {
		if currMonth.After(minDate) || currMonth.Equal(minDate) {
			diff := currMonth.Sub(minDate).Hours()
			x := labelWidth + (diff/totalDuration)*chartWidth
			if x >= labelWidth && x <= totalWidth-20 {
				sb.WriteString(fmt.Sprintf(`<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" stroke="var(--color-border, #30363d)" stroke-dasharray="3,3" stroke-width="1" />`, x, topMargin-15, x, chartHeight-15))
				monthLabel := currMonth.Format("Jan '06")
				sb.WriteString(fmt.Sprintf(`<text x="%.1f" y="%d" font-family="var(--font-mono, monospace)" font-size="15" font-weight="600" fill="var(--color-text-muted, #8b949e)" text-anchor="middle">%s</text>`, x, topMargin-24, monthLabel))
			}
		}
		currMonth = currMonth.AddDate(0, 1, 0)
	}

	// Header separator line
	sb.WriteString(fmt.Sprintf(`<line x1="15" y1="%d" x2="%d" y2="%d" stroke="var(--color-border, #30363d)" stroke-width="1.5" />`, topMargin-10, totalWidth-15, topMargin-10))

	// Render each task row
	for i, task := range parsed {
		yRow := topMargin + i*rowHeight
		yBar := yRow + (rowHeight-barHeight)/2

		// Zebra background for rows
		if i%2 == 1 {
			sb.WriteString(fmt.Sprintf(`<rect x="10" y="%d" width="%d" height="%d" fill="var(--color-bg-subtle, rgba(255,255,255,0.02))" rx="4" />`, yRow, totalWidth-20, rowHeight))
		}

		// Task name text - increased font size to 16px with crisp semi-bold weight
		cleanName := template.HTMLEscapeString(task.name)
		sb.WriteString(fmt.Sprintf(`<text x="25" y="%d" font-family="var(--font-sans, system-ui, sans-serif)" font-size="16" font-weight="600" fill="var(--color-text, #c9d1d9)" dominant-baseline="middle">%s</text>`, yBar+barHeight/2, cleanName))

		// Task bar coordinates
		startDiff := task.start.Sub(minDate).Hours()
		endDiff := task.end.Sub(minDate).Hours()
		xStart := labelWidth + (startDiff/totalDuration)*chartWidth
		xEnd := labelWidth + (endDiff/totalDuration)*chartWidth
		barW := xEnd - xStart
		if barW < 8 {
			barW = 8
		}

		// Background track bar
		sb.WriteString(fmt.Sprintf(`<rect x="%.1f" y="%d" width="%.1f" height="%d" rx="5" fill="var(--color-track, rgba(255,255,255,0.08))" />`, xStart, yBar, barW, barHeight))

		// Progress bar
		if task.progress > 0 {
			progW := barW * float64(task.progress) / 100.0
			sb.WriteString(fmt.Sprintf(`<rect x="%.1f" y="%d" width="%.1f" height="%d" rx="5" fill="%s" opacity="0.92" />`, xStart, yBar, progW, barHeight, task.color))
		}

		// Percentage / Date label - increased font size to 14px bold
		progLabel := fmt.Sprintf("%d%%", task.progress)
		textX := xStart + barW + 10
		if textX+45 > totalWidth-10 {
			textX = xStart - 46
		}
		sb.WriteString(fmt.Sprintf(`<text x="%.1f" y="%d" font-family="var(--font-mono, monospace)" font-size="14" font-weight="700" fill="var(--color-text-muted, #8b949e)" dominant-baseline="middle">%s</text>`, textX, yBar+barHeight/2, progLabel))
	}

	sb.WriteString(`</svg>`)
	return template.HTML(sb.String())
}
