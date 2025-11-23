  },
premiumUnlock: () => {
  const event = new CustomEvent('celebration', {
    detail: { type: 'premium-unlock' },
  });
  window.dispatchEvent(event);
},
  achievement: () => {
    const event = new CustomEvent('celebration', {
      detail: { type: 'achievement' },
    });
    window.dispatchEvent(event);
  },
    rankUp: () => {
      const event = new CustomEvent('celebration', {
        detail: { type: 'rank-up' },
      });
      window.dispatchEvent(event);
    },
      legendary: () => {
        const event = new CustomEvent('celebration', {
          detail: { type: 'legendary' },
        });
        window.dispatchEvent(event);
      },
};
