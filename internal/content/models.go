package content

import (
	"html/template"
	"time"
)

type GanttTask struct {
	Name     string `yaml:"name"`
	Start    string `yaml:"start"`
	End      string `yaml:"end"`
	Progress int    `yaml:"progress"`
	Color    string `yaml:"color"`
}

type TimelineItem struct {
	Title string `yaml:"title"`
	Date  string `yaml:"date"`
	Link  string `yaml:"link"`
}

type Frontmatter struct {
	Title       string         `yaml:"title"`
	Date        string         `yaml:"date"`
	Description string         `yaml:"description"`
	Tags        []string       `yaml:"tags"`
	Featured    bool           `yaml:"featured"`
	IsIndex     bool           `yaml:"isIndex"`
	ProjectSlug string         `yaml:"projectSlug"`
	Gantt       any            `yaml:"gantt"` // Can be bool or []GanttTask
	Timeline    []TimelineItem `yaml:"timeline"`
}

type PostType string

const (
	TypeProject       PostType = "project"
	TypeProjectUpdate PostType = "project_update"
	TypeBlog          PostType = "blog"
	TypePage          PostType = "page"
)

type Post struct {
	Slug          string
	URL           string
	Title         string
	Date          time.Time
	DateFormatted string
	Description   string
	Tags          []string
	ContentHTML   template.HTML
	RawContent    string
	Frontmatter   Frontmatter
	Type          PostType
	ProjectSlug   string
	Updates       []*Post
	LatestUpdate  *Post
	GanttTasks    []GanttTask
	GanttSVG      template.HTML
	HasMath       bool
	HasMermaid    bool
}

type TagGroup struct {
	Name  string
	Slug  string
	URL   string
	Count int
	Posts []*Post
}

type SiteData struct {
	Projects       []*Post
	RecentProjects []*Post
	BlogPosts      []*Post
	RecentBlog     []*Post
	AllPosts       []*Post
	Tags           []*TagGroup
	Pages          map[string]*Post
}
