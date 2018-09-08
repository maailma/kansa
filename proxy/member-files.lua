-- Original source (Apache License 2.0):
-- https://github.com/ubergarm/openresty-nginx-jwt/blob/a1571c7/bearer.lua

local jwt = require "resty.jwt"

-- try to find JWT token as Cookie packet=BLAH
local token = ngx.var.cookie_files

if token == nil then
    ngx.status = ngx.HTTP_UNAUTHORIZED
    ngx.header.content_type = "text/plain; charset=utf-8"
    ngx.say("Please log in again to download member-only files")
    ngx.exit(ngx.HTTP_UNAUTHORIZED)
end

-- https://github.com/SkyLothar/lua-resty-jwt#jwt-validators
local validators = require "resty.jwt-validators"
local claim_spec = {
    validators.set_system_leeway(15), -- time in seconds
    exp = validators.is_not_expired(),
}

-- make sure to set and put "env JWT_SECRET;" in nginx.conf
local jwt_obj = jwt:verify(os.getenv("JWT_SECRET"), token, claim_spec)
if not jwt_obj["verified"] then
    ngx.status = ngx.HTTP_UNAUTHORIZED
    ngx.log(ngx.WARN, jwt_obj.reason)
    ngx.header.content_type = "text/plain; charset=utf-8"
    ngx.say("Error: " .. jwt_obj.reason)
    ngx.exit(ngx.HTTP_UNAUTHORIZED)
end
