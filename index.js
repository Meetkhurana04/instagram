export default {
  async fetch(request) {
    const url = new URL(request.url);
    const username = url.searchParams.get('username');

    if (!username) {
      return new Response(JSON.stringify({ error: "username parameter missing" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const targetUrl = `https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`;

    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "x-ig-app-id": "936619743392459",
      "Referer": "https://www.instagram.com/",
      "Origin": "https://www.instagram.com"
    };

    try {
      const response = await fetch(targetUrl, { headers });

      if (response.status !== 200) {
        return new Response(JSON.stringify({ error: "Instagram blocked", status: response.status }), { 
          status: 429 
        });
      }

      const data = await response.json();
      const user = data?.data?.user;

      if (!user) {
        return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
      }

      const result = {
        success: true,
        username: user.username,
        full_name: user.full_name,
        followers_count: user.edge_followed_by.count,
        following_count: user.edge_follow.count,
        posts_count: user.edge_owner_to_timeline_media.count,
        bio: user.biography,
        is_verified: user.is_verified,
        is_private: user.is_private,
        profile_pic: user.profile_pic_url_hd || user.profile_pic_url
      };

      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: "Something went wrong" }), { status: 500 });
    }
  }
};