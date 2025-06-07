# Complete Redmine setup script
puts ""
puts "🔧 Starting Redmine setup..."

# Disable authentication and enable anonymous access
Setting.login_required = 0
Setting.self_registration = "3"

# Grant full permissions to anonymous role
anonymous_role = Role.find_by(builtin: Role::BUILTIN_ANONYMOUS)
if anonymous_role
  permissions = [
    :view_issues, :add_issues, :edit_issues, :delete_issues,
    :add_issue_notes, :edit_issue_notes, :edit_own_issue_notes,
    :delete_issue_notes, :delete_own_issue_notes, :view_private_notes,
    :set_notes_private, :view_issue_watchers, :add_issue_watchers,
    :delete_issue_watchers, :manage_public_queries, :save_queries,
    :view_gantt, :view_calendar, :view_documents, :add_documents,
    :edit_documents, :delete_documents, :view_wiki_pages, :view_wiki_edits,
    :edit_wiki_pages, :delete_wiki_pages, :protect_wiki_pages, :manage_wiki,
    :rename_wiki_pages, :delete_wiki_pages_attachments, :view_files,
    :manage_files, :browse_repository, :view_changesets, :commit_access,
    :manage_related_issues, :manage_subtasks, :manage_categories,
    :view_time_entries, :log_time, :edit_time_entries, :edit_own_time_entries,
    :manage_project_activities
  ]
  anonymous_role.permissions = permissions
  anonymous_role.save!
  puts ""
  puts "📋 Configuration Summary:"
  puts "  Anonymous permissions: #{anonymous_role.permissions.size} permissions granted"
end


# Create/update admin user
admin_password = ENV["REDMINE_ADMIN_PASSWORD"] || "admin123"
admin = User.find_by(login: "admin")
admin.update!(
  password: admin_password, password_confirmation: admin_password,
  admin: true, status: 1, must_change_passwd: false, mail: "admin@example.com"
)

puts ""
puts "👤 Admin Account:"
puts "  Username: #{admin.login}"
puts "  Password: #{admin_password}"

# Configure system settings
Setting.issues_export_limit = 0
Setting.cross_project_issue_relations = true
Setting.default_projects_public = true
Setting.attachment_max_size = 0
Setting.file_max_size_displayed = 0
Setting.default_projects_tracker_ids = Tracker.all.pluck(:id)
Setting.mail_from = "noreply@example.com"
Setting.plain_text_mail = true
Setting.notified_events = []
Rails.logger.level = Logger::ERROR

# Create basic data if needed
IssueStatus.create!(name: "New", is_closed: false) if IssueStatus.count == 0
IssuePriority.create!(name: "Normal") if IssuePriority.count == 0
Tracker.create!(name: "Bug", default_status: IssueStatus.first) if Tracker.count == 0

# Create test project
project = Project.find_or_create_by(identifier: "test-project-ext") do |p|
  p.name = "Test Project for Extension"
  p.description = "Test project for Chrome extension testing"
  p.is_public = true
end

unless project.module_enabled?("issue_tracking")
  project.enabled_modules.create!(name: "issue_tracking")
end

project.trackers = Tracker.all
project.is_public = true
project.save!

# Create test issue and note
issue = Issue.create!(
  project: project, tracker: Tracker.first, status: IssueStatus.first,
  priority: IssuePriority.first, author: admin,
  subject: "Test Issue for Markdown Editor Extension",
  description: "This is a test issue for testing the Markdown editor extension.\n\n**Expected behavior:**\n- Extension should inject markdown editor\n- Should support markdown syntax\n- Should sync with original textarea"
)

Journal.create!(
  journalized: issue, user: admin,
  notes: "This is a test note to verify that the Markdown editor works when editing notes.\n\n**Test checklist:**\n- [ ] Click the edit button for this note\n- [ ] Verify markdown editor appears\n- [ ] Test markdown syntax highlighting"
)

puts ""
puts "🔗 Test URLs:"
puts "  Issue: /issues/#{issue.id}"

# Summary output
puts ""
puts "✅ Setup completed successfully!"
