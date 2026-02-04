import {
  LayoutDashboard,
  Folder,
  Users,
  TrendingUp,
  FileText,
  Sparkles,
  Plug,
  Settings,
  ChevronDown,
  Search,
  Bell,
  Plus,
  Download,
  ArrowRight,
  CircleAlert,
  Calendar,
} from "lucide-react";

// Sidebar Navigation Item Component
function NavItem({
  icon: Icon,
  label,
  active = false,
  iconColor,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  iconColor?: string;
}) {
  return (
    <div
      className={`flex items-center gap-[10px] h-9 px-[10px] rounded-md w-full ${
        active ? "bg-[var(--accent-primary)]" : ""
      }`}
    >
      <Icon
        className={`w-[17px] h-[17px] ${
          iconColor
            ? `text-[${iconColor}]`
            : active
            ? "text-white"
            : "text-[var(--text-sidebar)]"
        }`}
        style={iconColor ? { color: iconColor } : undefined}
      />
      <span
        className={`text-[13px] ${
          active ? "text-white font-medium" : "text-[var(--text-sidebar)]"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

// KPI Card Component
function KpiCard({
  label,
  value,
  meta,
  metaHighlight = false,
}: {
  label: string;
  value: string;
  meta: string;
  metaHighlight?: boolean;
}) {
  return (
    <div className="flex-1 flex flex-col gap-2 p-5 bg-[var(--bg-surface)] rounded-[4px] border border-[var(--border-default)]">
      <span className="text-[10px] font-semibold text-[var(--text-muted)] tracking-[1px]">
        {label}
      </span>
      <span
        className={`font-bold text-[var(--text-primary)] leading-none ${
          value.length > 6 ? "text-2xl" : "text-[32px]"
        }`}
      >
        {value}
      </span>
      <span
        className={`text-xs ${
          metaHighlight
            ? "text-[var(--accent-primary)] font-medium"
            : "text-[var(--text-muted)]"
        }`}
      >
        {meta}
      </span>
    </div>
  );
}

// Status Summary Card Component
function StatusCard({
  count,
  title,
  subtitle,
  color,
  bgColor,
}: {
  count: string;
  title: string;
  subtitle: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="flex-1 flex items-center gap-4 h-[68px] px-5 bg-[var(--bg-surface)] rounded-[4px] border border-[var(--border-default)]">
      <div
        className="flex items-center justify-center w-11 h-11 rounded-lg"
        style={{ backgroundColor: bgColor }}
      >
        <span className="text-xl font-bold" style={{ color }}>
          {count}
        </span>
      </div>
      <div className="flex flex-col gap-[2px]">
        <span className="text-sm font-semibold text-[var(--text-primary)]">
          {title}
        </span>
        <span className="text-xs text-[var(--text-muted)]">{subtitle}</span>
      </div>
    </div>
  );
}

// Project Row Component
function ProjectRow({
  name,
  client,
  status,
  statusColor,
  progress,
  budget,
  budgetColor,
  ownerInitial,
  ownerColor,
  ownerName,
  deadline,
  year,
}: {
  name: string;
  client: string;
  status: string;
  statusColor: string;
  progress: number;
  budget: string;
  budgetColor?: string;
  ownerInitial: string;
  ownerColor: string;
  ownerName: string;
  deadline: string;
  year: string;
}) {
  return (
    <div className="flex items-center h-[52px] px-4 border-b border-[var(--border-light)]">
      <div className="flex flex-col gap-[2px] w-[200px]">
        <span className="text-[13px] font-medium text-[var(--text-primary)]">
          {name}
        </span>
        <span className="text-[11px] text-[var(--text-muted)]">{client}</span>
      </div>
      <div className="flex items-center gap-[5px] w-[95px]">
        <div
          className="w-[7px] h-[7px] rounded-[4px]"
          style={{ backgroundColor: statusColor }}
        />
        <span className="text-xs font-medium" style={{ color: statusColor }}>
          {status}
        </span>
      </div>
      <div className="flex flex-col gap-1 w-[110px]">
        <div className="w-20 h-[5px] rounded-[3px] bg-[var(--border-light)]">
          <div
            className="h-full rounded-[3px]"
            style={{
              width: `${progress}%`,
              backgroundColor: statusColor,
            }}
          />
        </div>
        <span className="text-[11px] text-[var(--text-secondary)]">
          {progress}%
        </span>
      </div>
      <span
        className="text-xs w-[110px]"
        style={{ color: budgetColor || "var(--text-secondary)" }}
      >
        {budget}
      </span>
      <div className="flex items-center gap-[7px] w-[90px]">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white"
          style={{ backgroundColor: ownerColor }}
        >
          {ownerInitial}
        </div>
        <span className="text-xs text-[var(--text-secondary)]">{ownerName}</span>
      </div>
      <div className="flex flex-col gap-[2px] w-20">
        <span className="text-xs font-medium text-[var(--text-primary)]">
          {deadline}
        </span>
        <span className="text-[11px] text-[var(--text-muted)]">{year}</span>
      </div>
    </div>
  );
}

// Alert Item Component
function AlertItem({
  icon: Icon,
  iconColor,
  iconBgColor,
  title,
  description,
  showBorder = true,
}: {
  icon: React.ElementType;
  iconColor: string;
  iconBgColor: string;
  title: string;
  description: string;
  showBorder?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 py-2 px-4 ${
        showBorder ? "border-b border-[var(--border-light)]" : ""
      }`}
    >
      <div
        className="flex items-center justify-center w-6 h-6 rounded-md"
        style={{ backgroundColor: iconBgColor }}
      >
        <Icon className="w-[14px] h-[14px]" style={{ color: iconColor }} />
      </div>
      <div className="flex flex-col gap-[2px] flex-1">
        <span className="text-[13px] font-semibold text-[var(--text-primary)]">
          {title}
        </span>
        <span className="text-xs text-[var(--text-secondary)]">
          {description}
        </span>
      </div>
    </div>
  );
}

// Deadline Item Component
function DeadlineItem({
  name,
  project,
  date,
  color,
  showBorder = true,
}: {
  name: string;
  project: string;
  date: string;
  color: string;
  showBorder?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between h-10 px-4 ${
        showBorder ? "border-b border-[var(--border-light)]" : ""
      }`}
    >
      <div className="flex items-center gap-[10px]">
        <div
          className="w-[3px] h-7 rounded-sm"
          style={{ backgroundColor: color }}
        />
        <div className="flex flex-col gap-[1px]">
          <span className="text-[13px] font-medium text-[var(--text-primary)]">
            {name}
          </span>
          <span className="text-[11px] text-[var(--text-muted)]">{project}</span>
        </div>
      </div>
      <span className="text-[13px] font-semibold" style={{ color }}>
        {date}
      </span>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="flex h-full w-full bg-[var(--bg-page)]">
      {/* Sidebar */}
      <aside className="flex flex-col w-60 h-full bg-[var(--bg-sidebar)]">
        {/* Logo Area */}
        <div className="flex items-center gap-[10px] h-16 px-5">
          <div className="w-7 h-7 rounded-md bg-[var(--accent-primary)]" />
          <span className="text-lg font-semibold text-[var(--text-on-accent)]">
            Meridian
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#2A2E36] w-full" />

        {/* Navigation Items */}
        <nav className="flex flex-col flex-1 p-2 overflow-y-auto">
          {/* Project Switcher */}
          <div className="flex items-center gap-2 h-12 px-[10px] rounded-md bg-[#252830] border border-[#333840]">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[var(--accent-primary)]">
              <span className="text-base font-bold text-white">P</span>
            </div>
            <div className="flex flex-col gap-[1px] flex-1">
              <span className="text-[13px] font-semibold text-white">
                Platform Migration
              </span>
              <span className="text-[11px] text-[var(--text-sidebar)]">
                TechCorp Industries
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-[var(--text-sidebar)]" />
          </div>

          {/* Workspace Section */}
          <span className="text-[10px] font-semibold text-[#4A5060] tracking-[1.2px] mt-4 mb-2">
            WORKSPACE
          </span>
          <NavItem icon={LayoutDashboard} label="Overview" active />
          <NavItem icon={Folder} label="Projects" />
          <NavItem icon={Users} label="Team" />
          <NavItem icon={TrendingUp} label="Budget" />
          <NavItem icon={FileText} label="Reports" />

          {/* Tools Section */}
          <span className="text-[10px] font-semibold text-[#4A5060] tracking-[1.2px] mt-4 mb-2">
            TOOLS
          </span>
          <NavItem
            icon={Sparkles}
            label="AI Assistant"
            iconColor="var(--accent-primary)"
          />
          <NavItem icon={Plug} label="Integrations" />
        </nav>

        {/* Sidebar Bottom */}
        <div className="flex flex-col">
          <div className="h-px bg-[#2A2E36] w-full" />

          {/* Settings */}
          <div className="flex items-center gap-[10px] h-[38px] px-5 rounded-md">
            <Settings className="w-[18px] h-[18px] text-[var(--text-sidebar)]" />
            <span className="text-[13px] text-[var(--text-sidebar)]">
              Settings
            </span>
          </div>

          {/* User Profile */}
          <div className="relative h-[52px] px-5">
            <div className="absolute left-5 top-0 w-8 h-8 rounded-full bg-[#4B5563] flex items-center justify-center">
              <span className="text-[11px] font-semibold text-white">SR</span>
            </div>
            <div className="absolute left-14 top-2 flex flex-col gap-[1px]">
              <span className="text-[13px] font-medium text-[var(--text-on-accent)]">
                Sarah Reed
              </span>
              <span className="text-[11px] text-[var(--text-sidebar)]">
                VP Operations
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between h-[60px] px-7 bg-[var(--bg-surface)] border-b border-[var(--border-default)]">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1">
            <span className="text-sm text-[var(--text-muted)]">Workspace</span>
            <span className="text-sm text-[var(--text-muted)]">/</span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              Overview
            </span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex items-center gap-2 h-[34px] px-3 rounded-[4px] bg-[var(--bg-surface-alt)] border border-[var(--border-default)] w-[180px]">
              <Search className="w-[15px] h-[15px] text-[var(--text-muted)]" />
              <span className="text-[13px] text-[var(--text-muted)]">
                Search...
              </span>
            </div>

            {/* Notifications */}
            <div className="relative flex items-center justify-center w-[34px] h-[34px] rounded-[4px] bg-[var(--bg-surface-alt)] border border-[var(--border-default)]">
              <Bell className="w-[18px] h-[18px] text-[var(--text-secondary)]" />
              <div className="absolute top-[6px] right-[6px] w-[7px] h-[7px] rounded-[4px] bg-[var(--status-off-track)]" />
            </div>

            {/* New Project Button */}
            <button className="flex items-center gap-[6px] h-[34px] px-4 rounded-[4px] bg-[var(--accent-primary)]">
              <Plus className="w-[15px] h-[15px] text-white" />
              <span className="text-[13px] font-semibold text-white">
                New Project
              </span>
            </button>
          </div>
        </header>

        {/* Body Area */}
        <div className="flex flex-col flex-1 gap-5 p-5 px-7 overflow-y-auto">
          {/* Executive Header */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-[2px]">
              <h1 className="text-xl font-semibold text-[var(--text-primary)]">
                Executive Overview
              </h1>
              <p className="text-[13px] text-[var(--text-muted)]">
                Portfolio health and key metrics
              </p>
            </div>

            {/* Time Toggle */}
            <div className="flex h-[34px] rounded-[4px] bg-[var(--bg-surface-alt)] border border-[var(--border-default)]">
              <div className="flex items-center justify-center w-[66px] rounded-[4px]">
                <span className="text-[13px] text-[var(--text-muted)]">Week</span>
              </div>
              <div className="flex items-center justify-center w-[72px] rounded-[4px] bg-[var(--bg-surface)] border border-[var(--border-default)]">
                <span className="text-[13px] font-semibold text-[var(--text-primary)]">
                  Month
                </span>
              </div>
              <div className="flex items-center justify-center w-[72px] rounded-[4px]">
                <span className="text-[13px] text-[var(--text-muted)]">
                  Quarter
                </span>
              </div>
            </div>
          </div>

          {/* KPI Row */}
          <div className="flex gap-4">
            <KpiCard
              label="ACTIVE PROJECTS"
              value="24"
              meta="+3 this quarter"
              metaHighlight
            />
            <KpiCard
              label="TOTAL BUDGET"
              value="$4,850,000"
              meta="67% utilized"
            />
            <KpiCard
              label="TEAM CAPACITY"
              value="128 members"
              meta="86% allocated"
            />
            <KpiCard
              label="DELIVERY RATE"
              value="94%"
              meta="+2% vs last month"
              metaHighlight
            />
          </div>

          {/* Status Summary Row */}
          <div className="flex gap-4">
            <StatusCard
              count="18"
              title="On Track"
              subtitle="Projects on schedule"
              color="var(--status-on-track)"
              bgColor="var(--status-on-track-bg)"
            />
            <StatusCard
              count="4"
              title="At Risk"
              subtitle="Require attention"
              color="var(--status-at-risk)"
              bgColor="var(--status-at-risk-bg)"
            />
            <StatusCard
              count="2"
              title="Delayed"
              subtitle="Behind schedule"
              color="var(--status-off-track)"
              bgColor="var(--status-off-track-bg)"
            />
          </div>

          {/* Two Column Layout */}
          <div className="flex gap-5 flex-1 min-h-0">
            {/* Projects Column */}
            <div className="flex flex-col flex-1 min-w-0">
              {/* Projects Table */}
              <div className="flex flex-col bg-[var(--bg-surface)] rounded-[4px] border border-[var(--border-default)] overflow-hidden">
                {/* Projects Header */}
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-base font-semibold text-[var(--text-primary)]">
                    Active Projects
                  </span>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-[5px] h-[30px] px-[10px] rounded-[4px] bg-[var(--bg-surface-alt)] border border-[var(--border-default)]">
                      <Settings className="w-[13px] h-[13px] text-[var(--text-muted)]" />
                      <span className="text-xs text-[var(--text-secondary)]">
                        Filter
                      </span>
                    </button>
                    <button className="flex items-center gap-[5px] h-[30px] px-[10px] rounded-[4px] bg-[var(--bg-surface-alt)] border border-[var(--border-default)]">
                      <Download className="w-[13px] h-[13px] text-[var(--text-muted)]" />
                      <span className="text-xs text-[var(--text-secondary)]">
                        Export
                      </span>
                    </button>
                  </div>
                </div>

                {/* Table Header */}
                <div className="flex items-center h-[38px] px-4 bg-[var(--bg-surface-alt)] border-b border-[var(--border-default)]">
                  <span className="text-[11px] font-semibold text-[var(--text-muted)] tracking-[0.5px] w-[200px]">
                    Project
                  </span>
                  <span className="text-[11px] font-semibold text-[var(--text-muted)] tracking-[0.5px] w-[95px]">
                    Status
                  </span>
                  <span className="text-[11px] font-semibold text-[var(--text-muted)] tracking-[0.5px] w-[110px]">
                    Progress
                  </span>
                  <span className="text-[11px] font-semibold text-[var(--text-muted)] tracking-[0.5px] w-[110px]">
                    Budget
                  </span>
                  <span className="text-[11px] font-semibold text-[var(--text-muted)] tracking-[0.5px] w-[90px]">
                    Owner
                  </span>
                  <span className="text-[11px] font-semibold text-[var(--text-muted)] tracking-[0.5px] w-[80px]">
                    DEADLINE
                  </span>
                </div>

                {/* Table Rows */}
                <ProjectRow
                  name="Website Redesign"
                  client="GlobalTech Solutions"
                  status="On Track"
                  statusColor="var(--status-on-track)"
                  progress={72}
                  budget="$480K / $620K"
                  ownerInitial="M"
                  ownerColor="#6366F1"
                  ownerName="M. Chen"
                  deadline="Mar 15"
                  year="2026"
                />
                <ProjectRow
                  name="Mobile App v2.0"
                  client="RetailMax"
                  status="At Risk"
                  statusColor="var(--status-at-risk)"
                  progress={45}
                  budget="$210K / $400K"
                  ownerInitial="J"
                  ownerColor="#F59E0B"
                  ownerName="J. Park"
                  deadline="Apr 30"
                  year="2026"
                />
                <ProjectRow
                  name="Data Migration"
                  client="FinanceHub"
                  status="Off Track"
                  statusColor="var(--status-off-track)"
                  progress={20}
                  budget="$890K / $1.1M"
                  budgetColor="var(--status-off-track)"
                  ownerInitial="A"
                  ownerColor="#10B981"
                  ownerName="A. Torres"
                  deadline="Jun 15"
                  year="2026"
                />
                <ProjectRow
                  name="CRM Integration"
                  client="Global Logistics Ltd"
                  status="On Track"
                  statusColor="var(--status-on-track)"
                  progress={89}
                  budget="$340K / $380K"
                  ownerInitial="K"
                  ownerColor="#8B5CF6"
                  ownerName="K. Lee"
                  deadline="Feb 28"
                  year="2026"
                />
                <ProjectRow
                  name="Security Audit"
                  client="HealthFirst Medical"
                  status="At Risk"
                  statusColor="var(--status-at-risk)"
                  progress={30}
                  budget="$120K / $280K"
                  ownerInitial="R"
                  ownerColor="#EC4899"
                  ownerName="R. Patel"
                  deadline="Mar 31"
                  year="2026"
                />
                <ProjectRow
                  name="Analytics Platform"
                  client="DataSync Corp"
                  status="On Track"
                  statusColor="var(--status-on-track)"
                  progress={62}
                  budget="$560K / $750K"
                  ownerInitial="D"
                  ownerColor="#14B8A6"
                  ownerName="D. Kimura"
                  deadline="Jan 20"
                  year="2026"
                />

                {/* Table Footer */}
                <div className="flex items-center justify-between h-9 px-4 bg-[var(--bg-surface-alt)] border-t border-[var(--border-default)]">
                  <span className="text-xs text-[var(--text-muted)]">
                    Showing 6 of 24 projects
                  </span>
                  <div className="flex items-center gap-[6px]">
                    <span className="text-xs font-medium text-[var(--accent-primary)]">
                      View all projects
                    </span>
                    <ArrowRight className="w-[14px] h-[14px] text-[var(--accent-primary)]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-4 w-[380px] shrink-0">
              {/* Insights Panel */}
              <div className="flex flex-col bg-[var(--bg-surface)] rounded-[4px] border border-[var(--border-default)] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between h-[38px] px-4 border-b border-[var(--border-default)]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      Insights & Alerts
                    </span>
                  </div>
                  <div className="flex items-center justify-center w-[22px] h-[18px] rounded-full bg-[var(--status-off-track)]">
                    <span className="text-[11px] font-semibold text-white">3</span>
                  </div>
                </div>

                {/* Alert Items */}
                <AlertItem
                  icon={CircleAlert}
                  iconColor="var(--status-off-track)"
                  iconBgColor="var(--status-off-track-bg)"
                  title="Delay detected"
                  description="Data Migration is 12 days behind schedule."
                />
                <AlertItem
                  icon={TrendingUp}
                  iconColor="var(--status-at-risk)"
                  iconBgColor="var(--status-at-risk-bg)"
                  title="Budget anomaly"
                  description="Spend +34% vs baseline. On pace to exceed by $60K."
                />
                <AlertItem
                  icon={Calendar}
                  iconColor="var(--accent-primary)"
                  iconBgColor="var(--accent-light)"
                  title="Milestone approaching"
                  description="CRM Integration Phase 2 due Jan 31. No blockers."
                  showBorder={false}
                />
              </div>

              {/* Budget Burn Rate Panel */}
              <div className="flex flex-col bg-[var(--bg-surface)] rounded-[4px] border border-[var(--border-default)] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between h-[38px] px-4 border-b border-[var(--border-default)]">
                  <div className="flex flex-col gap-[1px]">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      Budget Burn Rate
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      Planned vs Actual (in thousands)
                    </span>
                  </div>
                </div>

                {/* Chart Area */}
                <div className="relative h-[108px] px-4 py-2">
                  {/* Y-Axis Labels */}
                  <div className="absolute left-4 top-2 flex flex-col justify-between h-[68px] w-[30px]">
                    <span className="text-[10px] text-[var(--text-muted)]">400</span>
                    <span className="text-[10px] text-[var(--text-muted)]">300</span>
                    <span className="text-[10px] text-[var(--text-muted)]">200</span>
                    <span className="text-[10px] text-[var(--text-muted)]">100</span>
                    <span className="text-[10px] text-[var(--text-muted)]">0</span>
                  </div>

                  {/* Grid Lines */}
                  <div className="absolute left-[48px] top-2 flex flex-col justify-between h-[68px] w-[310px]">
                    <div className="h-px bg-[var(--border-light)]" />
                    <div className="h-px bg-[var(--border-light)]" />
                    <div className="h-px bg-[var(--border-light)]" />
                    <div className="h-px bg-[var(--border-light)]" />
                    <div className="h-px bg-[var(--border-light)]" />
                  </div>

                  {/* Bars */}
                  <div className="absolute left-[48px] top-2 flex justify-between items-end h-[68px] w-[310px]">
                    {[
                      { p: 30, a: 37 },
                      { p: 34, a: 39 },
                      { p: 38, a: 32 },
                      { p: 42, a: 45 },
                      { p: 46, a: 49 },
                      { p: 50, a: 52 },
                    ].map((bar, i) => (
                      <div key={i} className="flex items-end gap-[3px] h-full">
                        <div
                          className="w-4 rounded-t-[3px] bg-[var(--border-default)]"
                          style={{ height: `${bar.p}px` }}
                        />
                        <div
                          className="w-4 rounded-t-[3px] bg-[#22D3EE]"
                          style={{ height: `${bar.a}px` }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* X-Axis Labels */}
                  <div className="absolute left-[48px] bottom-2 flex justify-between w-[310px]">
                    {["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"].map((month) => (
                      <span
                        key={month}
                        className="text-[10px] text-[var(--text-muted)]"
                      >
                        {month}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 h-6 px-4">
                  <div className="flex items-center gap-[6px]">
                    <div className="w-3 h-3 rounded-sm bg-[var(--border-default)]" />
                    <span className="text-xs text-[var(--text-secondary)]">
                      Planned
                    </span>
                  </div>
                  <div className="flex items-center gap-[6px]">
                    <div className="w-3 h-3 rounded-sm bg-[#22D3EE]" />
                    <span className="text-xs text-[var(--text-secondary)]">
                      Actual
                    </span>
                  </div>
                </div>
              </div>

              {/* Upcoming Deadlines Panel */}
              <div className="flex flex-col flex-1 bg-[var(--bg-surface)] rounded-[4px] border border-[var(--border-default)] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between h-[38px] px-4 border-b border-[var(--border-default)]">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    Upcoming Deadlines
                  </span>
                  <span className="text-xs font-medium text-[var(--accent-primary)]">
                    View all
                  </span>
                </div>

                {/* Deadline Items */}
                <div className="flex flex-col flex-1">
                  <DeadlineItem
                    name="Final Deployment"
                    project="Platform Migration"
                    date="Feb 28"
                    color="var(--status-off-track)"
                  />
                  <DeadlineItem
                    name="UAT Completion"
                    project="Mobile App v2.0"
                    date="Mar 10"
                    color="var(--status-at-risk)"
                    showBorder={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
