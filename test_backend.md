```
# =============================================
# 0. HEALTH CHECK
# =============================================
curl -s http://localhost:3000/health | jq

# =============================================
# 1. AUTH ROUTES
# =============================================

# Register a new user
curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123","fname":"Test","lname":"User"}' | jq

# Login as admin (save token)
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin_alice","password":"admin123"}' | jq -r '.data.token')
echo "ADMIN_TOKEN=$ADMIN_TOKEN"

# Login as regular user (save token)
USER_TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user_charlie","password":"user123"}' | jq -r '.data.token')
echo "USER_TOKEN=$USER_TOKEN"

# Login as moderator (save token)
MOD_TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"mod_bob","password":"mod123"}' | jq -r '.data.token')
echo "MOD_TOKEN=$MOD_TOKEN"

# Login as banned user (should work but requests will be blocked)
BANNED_TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"banned_eve","password":"banned123"}' | jq -r '.data.token')
echo "BANNED_TOKEN=$BANNED_TOKEN"

# Get current user info
curl -s http://localhost:3000/auth/me \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq

# Test banned user is blocked
curl -s http://localhost:3000/auth/me \
  -H "Authorization: Bearer $BANNED_TOKEN" | jq

# Test unauthenticated access
curl -s http://localhost:3000/auth/me | jq

# =============================================
# 2. DISCUSSION ROUTES
# =============================================

# List all discussions (public, no auth needed)
curl -s "http://localhost:3000/discussions" | jq

# List with pagination
curl -s "http://localhost:3000/discussions?page=1&limit=2" | jq

# Get single discussion by ID (with comments and reactions)
curl -s http://localhost:3000/discussions/1 | jq

# Get non-existent discussion
curl -s http://localhost:3000/discussions/999 | jq

# Create a discussion (as regular user)
curl -s -X POST http://localhost:3000/discussions \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My new discussion","content":"This is the content of my discussion"}' | jq

# Create a discussion (unauthenticated - should fail 401)
curl -s -X POST http://localhost:3000/discussions \
  -H "Content-Type: application/json" \
  -d '{"title":"Should fail","content":"No auth"}' | jq

# Create a discussion with missing fields (should fail 400)
curl -s -X POST http://localhost:3000/discussions \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":""}' | jq

# Update own discussion (user_charlie owns discussion 2)
curl -s -X PATCH http://localhost:3000/discussions/2 \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated title by owner"}' | jq

# Update someone else's discussion as regular user (should fail 403)
curl -s -X PATCH http://localhost:3000/discussions/1 \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Trying to edit admin post"}' | jq

# Update any discussion as admin (should succeed)
curl -s -X PATCH http://localhost:3000/discussions/2 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Admin edited this"}' | jq

# Delete someone else's discussion as regular user (should fail 403)
curl -s -X DELETE http://localhost:3000/discussions/1 \
  -H "Authorization: Bearer $USER_TOKEN" | jq

# =============================================
# 3. COMMENT ROUTES
# =============================================

# List comments for discussion 1
curl -s "http://localhost:3000/discussions/1/comments" | jq

# List comments with pagination
curl -s "http://localhost:3000/discussions/1/comments?page=1&limit=2" | jq

# List comments for non-existent discussion
curl -s "http://localhost:3000/discussions/999/comments" | jq

# Create a comment on discussion 1
curl -s -X POST http://localhost:3000/discussions/1/comments \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"This is my new comment!"}' | jq

# Create comment without auth (should fail 401)
curl -s -X POST http://localhost:3000/discussions/1/comments \
  -H "Content-Type: application/json" \
  -d '{"content":"No auth comment"}' | jq

# Create comment with empty content (should fail 400)
curl -s -X POST http://localhost:3000/discussions/1/comments \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":""}' | jq

# Update own comment (user_charlie owns comment 1)
curl -s -X PATCH http://localhost:3000/discussions/1/comments/1 \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Updated my comment"}' | jq

# Update someone else's comment as regular user (should fail 403)
curl -s -X PATCH http://localhost:3000/discussions/1/comments/2 \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Trying to edit diana comment"}' | jq

# Update any comment as moderator (should succeed)
curl -s -X PATCH http://localhost:3000/discussions/1/comments/2 \
  -H "Authorization: Bearer $MOD_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Moderator edited this comment"}' | jq

# Delete someone else's comment as regular user (should fail 403)
curl -s -X DELETE http://localhost:3000/discussions/1/comments/2 \
  -H "Authorization: Bearer $USER_TOKEN" | jq

# Delete any comment as admin (should succeed)
curl -s -X DELETE http://localhost:3000/discussions/1/comments/3 \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq

# =============================================
# 4. DISCUSSION REACTION ROUTES
# =============================================

# Add reaction to discussion 1
curl -s -X POST http://localhost:3000/discussions/1/reactions \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"love"}' | jq

# Update reaction (same user, same discussion = upsert)
curl -s -X POST http://localhost:3000/discussions/1/reactions \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"wow"}' | jq

# Invalid reaction type (should fail 400)
curl -s -X POST http://localhost:3000/discussions/1/reactions \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"invalid"}' | jq

# React to non-existent discussion (should fail 404)
curl -s -X POST http://localhost:3000/discussions/999/reactions \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"like"}' | jq

# Remove own reaction from discussion
curl -s -X DELETE http://localhost:3000/discussions/1/reactions \
  -H "Authorization: Bearer $USER_TOKEN" | jq

# Remove reaction that doesn't exist (should fail 404)
curl -s -X DELETE http://localhost:3000/discussions/1/reactions \
  -H "Authorization: Bearer $USER_TOKEN" | jq

# =============================================
# 5. COMMENT REACTION ROUTES
# =============================================

# Add reaction to comment 1 on discussion 1
curl -s -X POST http://localhost:3000/discussions/1/comments/1/reactions \
  -H "Authorization: Bearer $MOD_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"haha"}' | jq

# Update reaction on comment (upsert)
curl -s -X POST http://localhost:3000/discussions/1/comments/1/reactions \
  -H "Authorization: Bearer $MOD_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"sad"}' | jq

# Remove own reaction from comment
curl -s -X DELETE http://localhost:3000/discussions/1/comments/1/reactions \
  -H "Authorization: Bearer $MOD_TOKEN" | jq

# =============================================
# 6. USER ROUTES
# =============================================

# List users (requires user.read.any)
curl -s "http://localhost:3000/users" \
  -H "Authorization: Bearer $USER_TOKEN" | jq

# List users with pagination
curl -s "http://localhost:3000/users?page=1&limit=2" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq

# Get current user profile
curl -s http://localhost:3000/users/me \
  -H "Authorization: Bearer $USER_TOKEN" | jq

# Get user by ID
curl -s http://localhost:3000/users/3 \
  -H "Authorization: Bearer $USER_TOKEN" | jq

# Get non-existent user
curl -s http://localhost:3000/users/999 \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq

# Update own profile (user_charlie = id 3)
curl -s -X PATCH http://localhost:3000/users/3 \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fname":"Charles","lname":"Updated"}' | jq

# Update someone else's profile as regular user (should fail 403)
curl -s -X PATCH http://localhost:3000/users/1 \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fname":"Hacked"}' | jq

# Update any user as admin (should succeed)
curl -s -X PATCH http://localhost:3000/users/4 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fname":"Diana-Updated"}' | jq

# =============================================
# 7. BAN / UNBAN ROUTES
# =============================================

# Ban user_diana (id 4) as moderator
curl -s -X POST http://localhost:3000/users/4/ban \
  -H "Authorization: Bearer $MOD_TOKEN" | jq

# Try to ban admin as moderator (should fail 403)
curl -s -X POST http://localhost:3000/users/1/ban \
  -H "Authorization: Bearer $MOD_TOKEN" | jq

# Try to ban yourself (should fail 400)
curl -s -X POST http://localhost:3000/users/2/ban \
  -H "Authorization: Bearer $MOD_TOKEN" | jq

# Unban user_diana as admin
curl -s -X POST http://localhost:3000/users/4/unban \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq

# =============================================
# 8. DELETE USER
# =============================================

# Delete someone else as regular user (should fail 403)
curl -s -X DELETE http://localhost:3000/users/4 \
  -H "Authorization: Bearer $USER_TOKEN" | jq

# Delete admin as moderator (should fail 403)
curl -s -X DELETE http://localhost:3000/users/1 \
  -H "Authorization: Bearer $MOD_TOKEN" | jq

# =============================================
# 9. LOGOUT
# =============================================

# Logout admin
curl -s -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq

# Verify token is invalidated after logout (should fail 401)
curl -s http://localhost:3000/auth/me \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq

# =============================================
# 10. VALIDATION & EDGE CASES
# =============================================

# Register with too-short username (should fail 400)
curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"ab","password":"test123","fname":"X","lname":"Y"}' | jq

# Register with invalid username chars (should fail 400)
curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"bad user!","password":"test123","fname":"X","lname":"Y"}' | jq

# Register duplicate username (should fail 409)
curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin_alice","password":"test123","fname":"X","lname":"Y"}' | jq

# XSS attempt in discussion title (should be escaped)
curl -s -X POST http://localhost:3000/discussions \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"<script>alert(1)</script>","content":"XSS test"}' | jq

# Title too long (over 200 chars - should fail 400)
curl -s -X POST http://localhost:3000/discussions \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"$(printf 'A%.0s' {1..201})\",\"content\":\"test\"}" | jq
```