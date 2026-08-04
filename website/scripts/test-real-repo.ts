/**
 * Test with Real Repository
 *
 * Tests GitHub integration with the actual JamieWatters repository
 */

import { fetchProjectPlan } from '../lib/github';
import { parseProjectPlan, calculateCompletionPercentage } from '../lib/markdown-parser';
import { calculateReadTime } from '../lib/read-time-calculator';

async function testRealRepo() {
  console.log('='.repeat(60));
  console.log('Testing with Real Repository');
  console.log('='.repeat(60));

  try {
    const config = {
      owner: 'TheWayWithin',
      repo: 'JamieWatters',
    };

    console.log(`\nFetching project-plan.md from ${config.owner}/${config.repo}...`);

    const content = await fetchProjectPlan(config);

    console.log('✅ Successfully fetched project-plan.md');
    console.log(`Content length: ${content.length} characters\n`);

    // Parse the content
    console.log('Parsing tasks...\n');
    const parsed = parseProjectPlan(content);

    console.log('📊 Statistics:');
    console.log(`  Total tasks: ${parsed.tasks.length}`);
    console.log(`  Completed: ${parsed.completedTasks.length}`);
    console.log(`  In progress: ${parsed.inProgressTasks.length}`);
    console.log(`  Pending: ${parsed.pendingTasks.length}`);
    console.log(`  Completion: ${calculateCompletionPercentage(parsed)}%`);
    console.log(`  Read time: ${calculateReadTime(content)} minutes\n`);

    // Show recent completed tasks
    console.log('✅ Recently Completed Tasks (last 10):');
    parsed.completedTasks.slice(-10).forEach((task) => {
      const section = task.section ? ` [${task.section}]` : '';
      console.log(`  - ${task.content}${section}`);
    });

    // Show in-progress tasks
    if (parsed.inProgressTasks.length > 0) {
      console.log('\n⏳ In-Progress Tasks:');
      parsed.inProgressTasks.forEach((task) => {
        console.log(`  - ${task.content}`);
      });
    }

    // Show sections found
    console.log(`\n📑 Sections found: ${parsed.sections.length}`);
    parsed.sections.slice(0, 5).forEach((section) => {
      console.log(`  - ${section}`);
    });
    if (parsed.sections.length > 5) {
      console.log(`  ... and ${parsed.sections.length - 5} more`);
    }

    console.log('\n=== Test Complete ===');
    console.log('✅ GitHub integration working with real repository!');

  } catch (error) {
    // Read the two fields the way the old `catch (error: any)` did, off
    // whatever was thrown, rather than only off values that pass a guard.
    // Gating these on isGitHubError would lose the status and the hint below
    // for anything status-bearing whose message is missing, and would print
    // the whole object for a plain `{ message }`. The one deliberate
    // difference from the old code: a thrown null used to raise a TypeError
    // here instead of reporting, and now reports.
    const hasKey = <K extends string>(value: unknown, key: K): value is Record<K, unknown> =>
      typeof value === 'object' && value !== null && key in value;

    const read = (value: unknown, key: 'status' | 'message'): unknown =>
      hasKey(value, key) ? value[key] : undefined;

    const status = read(error, 'status');

    console.error('\n❌ Test failed:');
    console.error(`Status: ${status || 'unknown'}`);
    console.error(`Message: ${read(error, 'message') || error}`);

    if (status === 404) {
      console.error('\nNote: Make sure project-plan.md is committed and pushed to GitHub');
    } else if (status === 403) {
      console.error('\nNote: Rate limit or permissions issue');
    }

    process.exit(1);
  }
}

testRealRepo();
