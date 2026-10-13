<script lang="ts">
  // A static, deterministic interpretation of the supplied “big” reference.
  const clusters = Array.from({ length: 76 }, (_, i) => {
    const a = i * 2.399963;
    const r = Math.sqrt(i / 76) * 148;
    return {
      x: 215 + Math.cos(a) * r,
      y: 218 + Math.sin(a) * r * 0.91,
      size: 9 + ((i * 17) % 12),
      pink: Math.cos(a) * r > 23,
      opacity: 0.55 + (i % 4) * 0.12,
    };
  });
</script>

<svg class="molecules" viewBox="0 0 440 440" fill="none" aria-hidden="true">
  <defs>
    <radialGradient id="cyan-bead" cx="30%" cy="24%" r="85%"
      ><stop stop-color="#75e5e9" /><stop
        offset=".48"
        stop-color="#00b8c8"
      /><stop offset="1" stop-color="#13636b" /></radialGradient
    >
    <radialGradient id="pink-bead" cx="30%" cy="24%" r="85%"
      ><stop stop-color="#f474ce" /><stop
        offset=".48"
        stop-color="#c0008b"
      /><stop offset="1" stop-color="#640449" /></radialGradient
    >
  </defs>
  <path
    d="M64 109V51h58M318 51h58v58M376 331v58h-58M122 389H64v-58"
    stroke="#868686"
    stroke-width="1"
  />
  <path d="M64 51h312v338H64z" stroke="#686868" stroke-opacity=".45" />
  {#each clusters as cluster}
    <g opacity={cluster.opacity}>
      <circle
        cx={cluster.x}
        cy={cluster.y}
        r={cluster.size}
        fill={cluster.pink ? "url(#pink-bead)" : "url(#cyan-bead)"}
      />
      <circle
        cx={cluster.x + cluster.size * 0.55}
        cy={cluster.y - cluster.size * 0.42}
        r={cluster.size * 0.56}
        fill={cluster.pink ? "url(#pink-bead)" : "url(#cyan-bead)"}
      />
      <circle
        cx={cluster.x - cluster.size * 0.57}
        cy={cluster.y + cluster.size * 0.35}
        r={cluster.size * 0.53}
        fill={cluster.pink ? "url(#pink-bead)" : "url(#cyan-bead)"}
      />
    </g>
  {/each}
  <path d="M35 220h16M389 220h16M220 22v16M220 402v16" stroke="#ababab" />
</svg>
