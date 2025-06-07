# Complete Redmine setup script
puts "Starting complete Redmine setup..."

# Create admin user
admin = User.find_or_create_by(login: "admin") do |u|
  u.firstname = "Admin"
  u.lastname = "User"
  u.mail = "admin@example.com"
  u.password = "admin123"
  u.password_confirmation = "admin123"
  u.admin = true
  u.status = 1
  u.must_change_passwd = false
end

if admin.persisted? && !admin.admin?
  admin.update!(admin: true, password: "admin123", password_confirmation: "admin123", must_change_passwd: false)
end

puts "✅ Admin user: #{admin.login} (admin: #{admin.admin?})"

# Configure settings
Setting.self_registration = "3"
puts "✅ Self registration: #{Setting.self_registration}"

# Create basic issue data
if IssueStatus.count == 0
  status = IssueStatus.create!(name: "New", is_closed: false)
  puts "✅ Created status: #{status.name}"
end

if IssuePriority.count == 0
  priority = IssuePriority.create!(name: "Normal")
  puts "✅ Created priority: #{priority.name}"
end

if Tracker.count == 0
  tracker = Tracker.create!(name: "Bug", default_status: IssueStatus.first)
  puts "✅ Created tracker: #{tracker.name}"
end

puts "📊 Data summary - Statuses: #{IssueStatus.count}, Priorities: #{IssuePriority.count}, Trackers: #{Tracker.count}"

# Create test project
project = Project.find_or_create_by(identifier: "test-project-ext") do |p|
  p.name = "Test Project for Extension"
  p.description = "Test project for Chrome extension testing"
  p.is_public = true
end
puts "✅ Project: #{project.name}"

# Enable issue tracking module
unless project.module_enabled?("issue_tracking")
  project.enabled_modules.create!(name: "issue_tracking")
  puts "✅ Enabled issue tracking"
end

# Associate ALL trackers with the project
project.trackers = Tracker.all
project.save!
puts "✅ Project trackers: #{project.trackers.pluck(:name)}"

# Create a test issue
if project.trackers.any? && IssueStatus.any? && IssuePriority.any?
  issue = Issue.create!(
    project: project,
    tracker: Tracker.first,
    status: IssueStatus.first,
    priority: IssuePriority.first,
    subject: "Test Issue for Markdown Editor Extension",
    description: "This is a test issue for testing the Markdown editor extension.\n\n**Expected behavior:**\n- Extension should inject markdown editor\n- Should support markdown syntax\n- Should sync with original textarea",
    author: admin
  )
  puts "✅ Issue created: ##{issue.id} - #{issue.subject}"
  puts "🔗 Issue URL: http://localhost:3001/issues/#{issue.id}"
  puts "🔗 Issue edit URL: http://localhost:3001/issues/#{issue.id}/edit"
else
  puts "❌ Cannot create issue - missing required data"
end

puts "🎉 Complete setup finished!"