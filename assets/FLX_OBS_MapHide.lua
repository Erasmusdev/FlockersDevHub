obs = obslua

local source_name = ""
local hotkey_id = obs.OBS_INVALID_HOTKEY_ID

function set_visibility(visible)
    local source = obs.obs_get_source_by_name(source_name)
    if source ~= nil then
        -- This is the most direct way to show/hide in OBS
        obs.obs_source_set_enabled(source, visible)
        obs.obs_source_release(source)
    end
end

function on_hotkey(pressed)
    if pressed then
        set_visibility(true)
    else
        set_visibility(false)
    end
end

function script_description()
    return "Hold Hotkey to show Browser Source.\n\n1. Type source name.\n2. Bind G in Hotkeys."
end

function script_properties()
    local props = obs.obs_properties_create()
    obs.obs_properties_add_text(props, "source", "Source Name", obs.OBS_TEXT_DEFAULT)
    return props
end

function script_update(settings)
    source_name = obs.obs_data_get_string(settings, "source")
end

function script_load(settings)
    hotkey_id = obs.obs_hotkey_register_frontend("map_hide_simple", "Show Map (Hold)", on_hotkey)
    local htdata = obs.obs_data_get_array(settings, "htkey")
    obs.obs_hotkey_load(hotkey_id, htdata)
    obs.obs_data_array_release(htdata)
end